import unittest

from demo_simulation import pose
from smartguard_core import DetectorState, FallDetector


class FallDetectorTests(unittest.TestCase):
    def test_fall_is_confirmed_after_low_posture(self):
        detector = FallDetector()
        event = None
        for frame in range(34):
            phase = "standing" if frame < 8 else "fall"
            progress = 0.0 if frame < 8 else min(1.0, (frame - 8) / 8)
            event = detector.update(pose(phase, progress), frame / 10).fall_event or event
        self.assertIsNotNone(event)
        self.assertEqual(detector.state, DetectorState.ALERTED)

    def test_recovery_does_not_emit_event(self):
        detector = FallDetector()
        for frame in range(8):
            detector.update(pose("standing", 0), frame / 10)
        for frame in range(8, 16):
            detector.update(pose("fall", (frame - 8) / 8), frame / 10)
        events = []
        for frame in range(16, 22):
            result = detector.update(pose("recovery", (frame - 16) / 6), frame / 10)
            events.append(result.fall_event)
        self.assertTrue(all(item is None for item in events))

    def test_slow_lying_down_does_not_emit_event(self):
        detector = FallDetector()
        events = []
        for frame in range(8):
            detector.update(pose("standing", 0), frame / 10)
        # Spread the height change over six seconds: low posture without impact.
        for step in range(1, 61):
            result = detector.update(pose("fall", step / 60), (step + 7) / 10)
            events.append(result.fall_event)
        for step in range(20):
            result = detector.update(pose("fall", 1), (step + 68) / 10)
            events.append(result.fall_event)
        self.assertTrue(all(item is None for item in events))


if __name__ == "__main__":
    unittest.main()
