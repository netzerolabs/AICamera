import { useEffect, useRef, useState, useCallback } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import type { Results } from '@mediapipe/pose';
import type { PoseLandmark } from '@/types';

interface UseMediaPipeProps {
  onResults: (results: Results) => void;
  enabled: boolean;
}

interface UseMediaPipeReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isInitialized: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useMediaPipe({
  onResults,
  enabled,
}: UseMediaPipeProps): UseMediaPipeReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize MediaPipe Pose
  useEffect(() => {
    if (!enabled) return;

    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      onResults(results);

      // Draw on canvas for debugging
      if (canvasRef.current && videoRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

          if (results.poseLandmarks) {
            drawPose(ctx, results.poseLandmarks as PoseLandmark[], canvas.width, canvas.height);
          }
          ctx.restore();
        }
      }
    });

    poseRef.current = pose;
    setIsInitialized(true);

    return () => {
      pose.close();
      poseRef.current = null;
    };
  }, [enabled, onResults]);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!videoRef.current || !poseRef.current) {
      setError('Video or Pose not initialized');
      return;
    }

    try {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (poseRef.current && videoRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      await camera.start();
      cameraRef.current = camera;
      setError(null);
    } catch (err) {
      setError(
        'Camera access denied. Please allow camera permissions to use fall detection.'
      );
      console.error('Camera error:', err);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
  }, []);

  return {
    videoRef,
    canvasRef,
    isInitialized,
    error,
    startCamera,
    stopCamera,
  };
}

// Draw pose skeleton on canvas
function drawPose(
  ctx: CanvasRenderingContext2D,
  landmarks: PoseLandmark[],
  width: number,
  height: number
) {
  // Draw connections
  const connections = [
    [11, 12], // shoulders
    [11, 23], // left shoulder to hip
    [12, 24], // right shoulder to hip
    [23, 24], // hips
    [11, 13], // left arm
    [13, 15], // left forearm
    [12, 14], // right arm
    [14, 16], // right forearm
    [23, 25], // left thigh
    [25, 27], // left shin
    [24, 26], // right thigh
    [26, 28], // right shin
  ];

  ctx.strokeStyle = '#0056D2';
  ctx.lineWidth = 3;

  connections.forEach(([start, end]) => {
    const startPoint = landmarks[start];
    const endPoint = landmarks[end];

    if (startPoint && endPoint && (startPoint.visibility ?? 0) > 0.5 && (endPoint.visibility ?? 0) > 0.5) {
      ctx.beginPath();
      ctx.moveTo(startPoint.x * width, startPoint.y * height);
      ctx.lineTo(endPoint.x * width, endPoint.y * height);
      ctx.stroke();
    }
  });

  // Draw landmarks
  landmarks.forEach((landmark, index) => {
    if ((landmark.visibility ?? 0) > 0.5) {
      ctx.beginPath();
      ctx.arc(landmark.x * width, landmark.y * height, 5, 0, 2 * Math.PI);
      ctx.fillStyle = index === 0 ? '#FF6B00' : '#0056D2'; // Nose in orange
      ctx.fill();
    }
  });
}
