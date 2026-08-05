import { useState, useCallback, useRef, useEffect } from 'react';
import type { Results } from '@mediapipe/pose';
import { FallDetectionService } from '@/services/FallDetection';
import type { FallDetectionState, FallEvent, VelocityData, PoseLandmark } from '@/types';

interface UseFallDetectionProps {
  onFallDetected?: (event: FallEvent) => void;
  onCountdownComplete?: () => void;
  enabled: boolean;
}

interface UseFallDetectionReturn {
  state: FallDetectionState;
  velocities: VelocityData | null;
  currentPose: PoseLandmark[] | null;
  handlePoseResults: (results: Results) => void;
  confirmFall: () => void;
  cancelFall: () => void;
  resetDetection: () => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

const COUNTDOWN_DURATION = 10; // seconds

export function useFallDetection({
  onFallDetected,
  onCountdownComplete,
  enabled,
}: UseFallDetectionProps): UseFallDetectionReturn {
  const [state, setState] = useState<FallDetectionState>({
    isMonitoring: false,
    fallDetected: false,
    countdownActive: false,
    countdownValue: COUNTDOWN_DURATION,
    lastFallTime: null,
    confidence: 0,
  });

  const [velocities, setVelocities] = useState<VelocityData | null>(null);
  const [currentPose, setCurrentPose] = useState<PoseLandmark[] | null>(null);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fallServiceRef = useRef<FallDetectionService>(
    new FallDetectionService()
  );

  // Handle pose detection results
  const handlePoseResults = useCallback(
    (results: Results) => {
      if (!enabled || !state.isMonitoring) return;

      if (results.poseLandmarks) {
        const landmarks = results.poseLandmarks as PoseLandmark[];
        setCurrentPose(landmarks);

        const detection = fallServiceRef.current.detectFall(landmarks);

        setVelocities(detection.velocities || null);

        // Check if fall is detected
        if (detection.fallDetected && !state.fallDetected) {
          setState((prev) => ({
            ...prev,
            fallDetected: true,
            confidence: detection.confidence,
          }));

          // Start countdown
          startCountdown();

          // Create fall event
          const fallEvent: FallEvent = {
            id: Date.now().toString(),
            timestamp: new Date(),
            confidence: detection.confidence,
            status: 'detected',
            skeletonData: landmarks,
          };

          onFallDetected?.(fallEvent);
        }
      }
    },
    [enabled, state.isMonitoring, state.fallDetected, onFallDetected]
  );

  // Start countdown
  const startCountdown = useCallback(() => {
    setState((prev) => ({
      ...prev,
      countdownActive: true,
      countdownValue: COUNTDOWN_DURATION,
    }));

    let remaining = COUNTDOWN_DURATION;

    countdownRef.current = setInterval(() => {
      remaining -= 1;

      setState((prev) => ({
        ...prev,
        countdownValue: remaining,
      }));

      if (remaining <= 0) {
        // Countdown complete - send alert
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }

        setState((prev) => ({
          ...prev,
          countdownActive: false,
          lastFallTime: new Date(),
        }));

        onCountdownComplete?.();
      }
    }, 1000);
  }, [onCountdownComplete]);

  // Confirm fall (user didn't respond)
  const confirmFall = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    setState((prev) => ({
      ...prev,
      fallDetected: true,
      countdownActive: false,
      lastFallTime: new Date(),
    }));

    onCountdownComplete?.();
  }, [onCountdownComplete]);

  // Cancel fall (user pressed "I'm OK")
  const cancelFall = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    fallServiceRef.current.reset();

    setState((prev) => ({
      ...prev,
      fallDetected: false,
      countdownActive: false,
      countdownValue: COUNTDOWN_DURATION,
      confidence: 0,
    }));
  }, []);

  // Reset detection
  const resetDetection = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    fallServiceRef.current.reset();

    setState({
      isMonitoring: false,
      fallDetected: false,
      countdownActive: false,
      countdownValue: COUNTDOWN_DURATION,
      lastFallTime: null,
      confidence: 0,
    });
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    fallServiceRef.current.reset();
    setState((prev) => ({
      ...prev,
      isMonitoring: true,
      fallDetected: false,
      countdownActive: false,
      countdownValue: COUNTDOWN_DURATION,
      confidence: 0,
    }));
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    setState((prev) => ({
      ...prev,
      isMonitoring: false,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  return {
    state,
    velocities,
    currentPose,
    handlePoseResults,
    confirmFall,
    cancelFall,
    resetDetection,
    startMonitoring,
    stopMonitoring,
  };
}
