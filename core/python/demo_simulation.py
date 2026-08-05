"""Offline, deterministic fall-detection demo. / Demo mô phỏng ngoại tuyến."""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict

from smartguard_core import FallDetector, Landmark


def pose(phase: str, progress: float) -> list[Landmark]:
    """Build a simple 33-point synthetic pose (normalized image coordinates)."""
    falling = min(max(progress, 0.0), 1.0)
    if phase == "standing":
        nose_y, hip_y, ankle_y = 0.20, 0.52, 0.92
    elif phase == "fall":
        nose_y = 0.20 + 0.55 * falling
        hip_y = 0.52 + 0.30 * falling
        ankle_y = 0.92 - 0.10 * falling
    else:  # recovery: stand back up, useful to show cancellation
        nose_y = 0.75 - 0.55 * falling
        hip_y = 0.82 - 0.30 * falling
        ankle_y = 0.82 + 0.10 * falling
    points = [Landmark(0.50, 0.50) for _ in range(33)]
    for index in (0,):
        points[index] = Landmark(0.50, nose_y)
    for index, x in ((11, 0.44), (12, 0.56)):
        points[index] = Landmark(x, nose_y + 0.18)
    for index, x in ((23, 0.46), (24, 0.54)):
        points[index] = Landmark(x, hip_y)
    for index, x in ((27, 0.46), (28, 0.54)):
        points[index] = Landmark(x, ankle_y)
    return points


def run(scenario: str) -> list[dict[str, object]]:
    detector = FallDetector()
    timeline: list[dict[str, object]] = []
    frames: list[tuple[str, float]] = []
    frames += [("standing", 0.0)] * 8
    frames += [("fall", i / 8) for i in range(1, 9)]
    if scenario == "recovery":
        frames += [("recovery", i / 6) for i in range(1, 7)]
    else:
        frames += [("fall", 1.0)] * 18
    for frame, (phase, progress) in enumerate(frames):
        result = detector.update(pose(phase, progress), frame / 10.0)
        row = {
            "frame": frame,
            "t_s": round(result.timestamp, 2),
            "phase": phase,
            "state": result.state.value,
            "confidence": result.confidence,
            "body_height": round(result.body_height or 0.0, 3),
            "descent_velocity": round(result.descent_velocity, 3),
            "on_ground": result.on_ground,
            "event": asdict(result.fall_event) if result.fall_event else None,
        }
        timeline.append(row)
        if result.fall_event:
            print(f"🚨 FALL / TÉ NGÃ at t={result.timestamp:.1f}s — confidence {result.confidence:.1f}%")
    return timeline


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SmartGuard offline pose simulation / mô phỏng tư thế")
    parser.add_argument("--scenario", choices=("fall", "recovery"), default="fall")
    parser.add_argument("--json", action="store_true", help="print full timeline as JSON")
    args = parser.parse_args()
    data = run(args.scenario)
    print("✅ Completed / Hoàn tất — frames:", len(data))
    if args.json:
        print(json.dumps(data, ensure_ascii=False, indent=2))
