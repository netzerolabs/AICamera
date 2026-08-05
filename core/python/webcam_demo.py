"""Minimal MediaPipe + OpenCV adapter. / Adapter camera tối giản."""

from __future__ import annotations

import argparse
import time

import cv2
import mediapipe as mp

from smartguard_core import FallDetector, mediapipe_landmarks


def main(camera_index: int) -> None:
    detector = FallDetector()
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        raise SystemExit("Cannot open camera / Không mở được camera")
    pose = mp.solutions.pose.Pose(model_complexity=0, min_detection_confidence=0.55, min_tracking_confidence=0.55)
    draw = mp.solutions.drawing_utils
    connections = mp.solutions.pose.POSE_CONNECTIONS
    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            result = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            if result.pose_landmarks:
                draw.draw_landmarks(frame, result.pose_landmarks, connections)
                detection = detector.update(mediapipe_landmarks(result), time.monotonic())
                label = f"{detection.state.value} | {detection.confidence:04.1f}%"
                if detection.fall_event:
                    label = "ALERT / CẢNH BÁO " + label
                cv2.putText(frame, label, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 50, 255) if detection.fall_event else (30, 200, 80), 2)
            cv2.imshow("AICamera SmartGuard (q to quit)", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
    finally:
        pose.close()
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--camera", type=int, default=0)
    main(parser.parse_args().camera)
