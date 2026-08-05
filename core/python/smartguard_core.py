"""Privacy-first passive fall detection from pose landmarks.

VI: Lõi không đọc ảnh; nó chỉ nhận landmark (x, y, visibility) đã được tạo bởi
MediaPipe, OpenPose hoặc YOLO-Pose. Mọi ngưỡng đều có thể hiệu chỉnh theo camera.
EN: The core never reads pixels; it consumes landmarks produced by MediaPipe,
OpenPose or YOLO-Pose. All thresholds are configurable for the camera setup.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from math import atan2, degrees, hypot
from statistics import median
from typing import Any, Iterable, Mapping, Sequence


class DetectorState(str, Enum):
    CALIBRATING = "calibrating"
    STANDING = "standing"
    DESCENDING = "descending"
    ON_GROUND = "on_ground"
    ALERTED = "alerted"
    UNKNOWN = "unknown"


@dataclass(frozen=True)
class Landmark:
    x: float
    y: float
    visibility: float = 1.0

    @classmethod
    def from_any(cls, value: Any) -> "Landmark":
        """Accept MediaPipe objects, mappings, or ``(x, y[, visibility])``."""
        if isinstance(value, cls):
            return value
        if isinstance(value, Mapping):
            return cls(float(value["x"]), float(value["y"]), float(value.get("visibility", 1.0)))
        return cls(float(value[0]), float(value[1]), float(value[2]) if len(value) > 2 else 1.0)


@dataclass(frozen=True)
class DetectorConfig:
    min_visibility: float = 0.55
    height_drop_ratio: float = 0.55
    descent_velocity_threshold: float = 0.28  # normalized body-height units / second
    low_hip_y: float = 0.62
    confirmation_seconds: float = 1.2
    recovery_seconds: float = 3.0
    smoothing_window: int = 5


@dataclass(frozen=True)
class FallEvent:
    timestamp: float
    confidence: float
    state: str
    evidence: dict[str, float]
    message_vi: str = "Phát hiện khả năng té ngã — hãy kiểm tra ngay."
    message_en: str = "Possible fall detected — please check now."


@dataclass(frozen=True)
class DetectionResult:
    timestamp: float
    state: DetectorState
    confidence: float
    body_height: float | None
    descent_velocity: float
    hip_y: float | None
    torso_angle: float | None
    on_ground: bool
    fall_event: FallEvent | None = None
    reason: str = ""


# MediaPipe Pose indices. / Chỉ số landmark MediaPipe Pose.
NOSE, LEFT_SHOULDER, RIGHT_SHOULDER = 0, 11, 12
LEFT_HIP, RIGHT_HIP = 23, 24
LEFT_ANKLE, RIGHT_ANKLE = 27, 28


class FallDetector:
    """Small deterministic state machine suitable for mobile/edge inference."""

    def __init__(self, config: DetectorConfig | None = None) -> None:
        self.config = config or DetectorConfig()
        self.reset()

    def reset(self) -> None:
        self.state = DetectorState.CALIBRATING
        self.initial_height: float | None = None
        self.last_height: float | None = None
        self.last_timestamp: float | None = None
        self.low_since: float | None = None
        self.descending_since: float | None = None
        self._height_history: list[float] = []
        self._velocity_history: list[float] = []
        self._last_event_at: float | None = None
        self._fall_candidate = False
        self._peak_descent_velocity = 0.0

    @staticmethod
    def _height(pose: Sequence[Landmark]) -> float:
        nose = pose[NOSE]
        ankle_y = (pose[LEFT_ANKLE].y + pose[RIGHT_ANKLE].y) / 2
        return abs(ankle_y - nose.y)

    @staticmethod
    def _torso_angle(pose: Sequence[Landmark]) -> float:
        shoulder = Landmark(
            (pose[LEFT_SHOULDER].x + pose[RIGHT_SHOULDER].x) / 2,
            (pose[LEFT_SHOULDER].y + pose[RIGHT_SHOULDER].y) / 2,
        )
        hip = Landmark(
            (pose[LEFT_HIP].x + pose[RIGHT_HIP].x) / 2,
            (pose[LEFT_HIP].y + pose[RIGHT_HIP].y) / 2,
        )
        # 0° = upright vertical; 90° = horizontal torso. / 0° đứng, 90° nằm.
        return abs(degrees(atan2(hip.x - shoulder.x, hip.y - shoulder.y)))

    def _valid(self, pose: Sequence[Landmark]) -> bool:
        required = (NOSE, LEFT_HIP, RIGHT_HIP, LEFT_ANKLE, RIGHT_ANKLE)
        return len(pose) > RIGHT_ANKLE and all(pose[i].visibility >= self.config.min_visibility for i in required)

    def update(self, landmarks: Iterable[Any], timestamp: float) -> DetectionResult:
        """Process one frame. ``timestamp`` is monotonic seconds (not wall clock)."""
        pose = [Landmark.from_any(item) for item in landmarks]
        if not self._valid(pose):
            return DetectionResult(timestamp, DetectorState.UNKNOWN, 0.0, None, 0.0, None, None, False, reason="low_landmark_visibility")

        height = self._height(pose)
        hip_y = (pose[LEFT_HIP].y + pose[RIGHT_HIP].y) / 2
        torso_angle = self._torso_angle(pose)
        if self.initial_height is None:
            # Calibration is deliberately conservative: first valid frame is expected standing.
            self.initial_height = max(height, 1e-6)
            self.last_height, self.last_timestamp = height, timestamp
            self.state = DetectorState.STANDING
            return DetectionResult(timestamp, self.state, 0.0, height, 0.0, hip_y, torso_angle, False, reason="calibrated")

        dt = max(timestamp - (self.last_timestamp or timestamp), 1e-3)
        raw_velocity = max(0.0, (self.last_height - height) / dt) if self.last_height is not None else 0.0
        self._height_history.append(height)
        self._height_history = self._height_history[-self.config.smoothing_window :]
        self._velocity_history.append(raw_velocity)
        self._velocity_history = self._velocity_history[-self.config.smoothing_window :]
        velocity = median(self._velocity_history)
        self._peak_descent_velocity = max(self._peak_descent_velocity, velocity)
        height_ratio = height / self.initial_height
        on_ground = height_ratio <= self.config.height_drop_ratio and hip_y >= self.config.low_hip_y
        rapid_descent = velocity >= self.config.descent_velocity_threshold

        if rapid_descent and not on_ground and self.state != DetectorState.ALERTED:
            self.state = DetectorState.DESCENDING
            self.descending_since = self.descending_since or timestamp
            self._fall_candidate = True
        if on_ground and self.state != DetectorState.ALERTED:
            self.low_since = self.low_since or timestamp
            self.state = DetectorState.ON_GROUND
        elif self.state in (DetectorState.ON_GROUND, DetectorState.DESCENDING):
            # Standing up inside the recovery window cancels a candidate.
            if self.low_since is not None and timestamp - self.low_since < self.config.recovery_seconds:
                self.low_since = None
                self.descending_since = None
                self._fall_candidate = False
                self._peak_descent_velocity = 0.0
                self.state = DetectorState.STANDING
            elif self.state != DetectorState.ALERTED:
                self.state = DetectorState.STANDING

        low_duration = timestamp - self.low_since if self.low_since is not None else 0.0
        descent_score = min(1.0, self._peak_descent_velocity / max(self.config.descent_velocity_threshold, 1e-6))
        drop_score = min(1.0, max(0.0, 1.0 - height_ratio) / max(1.0 - self.config.height_drop_ratio, 1e-6))
        ground_score = 1.0 if on_ground else 0.0
        confidence = round(100 * (0.45 * descent_score + 0.35 * drop_score + 0.20 * ground_score), 1)
        event = None
        if self._fall_candidate and on_ground and low_duration >= self.config.confirmation_seconds and self.state != DetectorState.ALERTED:
            self.state = DetectorState.ALERTED
            self._last_event_at = timestamp
            event = FallEvent(timestamp, min(99.0, max(1.0, confidence)), self.state.value, {
                "height_ratio": round(height_ratio, 4),
                "descent_velocity": round(velocity, 4),
                "hip_y": round(hip_y, 4),
                "low_duration_s": round(low_duration, 3),
            })

        self.last_height, self.last_timestamp = height, timestamp
        reason = "rapid_descent_and_low_posture" if rapid_descent and on_ground else "tracking"
        return DetectionResult(timestamp, self.state, confidence, height, velocity, hip_y, torso_angle, on_ground, event, reason)


def mediapipe_landmarks(results: Any) -> list[Landmark]:
    """Convert ``results.pose_landmarks`` to the core format."""
    return [Landmark.from_any(point) for point in getattr(results, "pose_landmarks", [])]
