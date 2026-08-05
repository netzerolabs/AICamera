import type { PoseLandmark, VelocityData } from '@/types';

// MediaPipe Pose Landmark Indices
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

// Fall Detection Configuration
const CONFIG = {
  // Height drop threshold (50% of initial height)
  HEIGHT_DROP_THRESHOLD: 0.5,
  // Velocity threshold for rapid movement
  VELOCITY_THRESHOLD: 0.3,
  // Confirmation time (seconds) - must stay low for this duration
  CONFIRMATION_TIME: 2000,
  // False positive check time (seconds) - if user stands up within this time
  FALSE_POSITIVE_TIME: 5000,
  // Minimum confidence for pose detection
  MIN_CONFIDENCE: 0.5,
};

export class FallDetectionService {
  private poseHistory: { landmarks: PoseLandmark[]; timestamp: number }[] = [];
  private velocityHistory: VelocityData[] = [];
  private initialHeight: number = 0;
  private isCalibrated: boolean = false;
  private fallStartTime: number | null = null;
  private lastStandingTime: number = 0;
  private isOnGround: boolean = false;

  // Calculate height from nose to ankles
  private calculateHeight(landmarks: PoseLandmark[]): number {
    const nose = landmarks[POSE_LANDMARKS.NOSE];
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

    if (!nose || !leftAnkle || !rightAnkle) return 0;

    const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
    return Math.abs(nose.y - avgAnkleY);
  }

  // Calculate velocity of a landmark
  private calculateVelocity(
    current: PoseLandmark,
    previous: PoseLandmark,
    deltaTime: number
  ): number {
    if (deltaTime === 0) return 0;
    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance / deltaTime;
  }

  // Check if pose has sufficient confidence
  private hasValidConfidence(landmarks: PoseLandmark[]): boolean {
    const keyPoints = [
      POSE_LANDMARKS.NOSE,
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.RIGHT_HIP,
      POSE_LANDMARKS.LEFT_ANKLE,
      POSE_LANDMARKS.RIGHT_ANKLE,
    ];

    return keyPoints.every(
      (index) => (landmarks[index]?.visibility ?? 0) > CONFIG.MIN_CONFIDENCE
    );
  }

  // Calibrate initial standing height
  calibrate(landmarks: PoseLandmark[]): boolean {
    if (!this.hasValidConfidence(landmarks)) return false;

    this.initialHeight = this.calculateHeight(landmarks);
    if (this.initialHeight > 0.3) {
      // Minimum reasonable height
      this.isCalibrated = true;
      this.lastStandingTime = Date.now();
      return true;
    }
    return false;
  }

  // Check if person is on the ground
  private isPersonOnGround(landmarks: PoseLandmark[]): boolean {
    const currentHeight = this.calculateHeight(landmarks);
    const heightRatio = currentHeight / this.initialHeight;

    // Check if hips are low
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const avgHipY = (leftHip.y + rightHip.y) / 2;

    // Person is on ground if height dropped significantly AND hips are low
    return heightRatio < CONFIG.HEIGHT_DROP_THRESHOLD && avgHipY > 0.6;
  }

  // Calculate velocities for key body points
  private calculateVelocities(
    current: PoseLandmark[],
    previous: PoseLandmark[],
    deltaTime: number
  ): VelocityData {
    const noseVelocity = this.calculateVelocity(
      current[POSE_LANDMARKS.NOSE],
      previous[POSE_LANDMARKS.NOSE],
      deltaTime
    );

    const leftHip = current[POSE_LANDMARKS.LEFT_HIP];
    const rightHip = current[POSE_LANDMARKS.RIGHT_HIP];
    const prevLeftHip = previous[POSE_LANDMARKS.LEFT_HIP];
    const prevRightHip = previous[POSE_LANDMARKS.RIGHT_HIP];

    const hipVelocity =
      (this.calculateVelocity(leftHip, prevLeftHip, deltaTime) +
        this.calculateVelocity(rightHip, prevRightHip, deltaTime)) /
      2;

    const leftAnkle = current[POSE_LANDMARKS.LEFT_ANKLE];
    const rightAnkle = current[POSE_LANDMARKS.RIGHT_ANKLE];
    const prevLeftAnkle = previous[POSE_LANDMARKS.LEFT_ANKLE];
    const prevRightAnkle = previous[POSE_LANDMARKS.RIGHT_ANKLE];

    const ankleVelocity =
      (this.calculateVelocity(leftAnkle, prevLeftAnkle, deltaTime) +
        this.calculateVelocity(rightAnkle, prevRightAnkle, deltaTime)) /
      2;

    return {
      noseVelocity,
      hipVelocity,
      ankleVelocity,
      timestamp: Date.now(),
    };
  }

  // Main fall detection logic
  detectFall(landmarks: PoseLandmark[]): {
    fallDetected: boolean;
    confidence: number;
    isOnGround: boolean;
    velocities?: VelocityData;
  } {
    if (!this.isCalibrated) {
      this.calibrate(landmarks);
      return { fallDetected: false, confidence: 0, isOnGround: false };
    }

    if (!this.hasValidConfidence(landmarks)) {
      return { fallDetected: false, confidence: 0, isOnGround: this.isOnGround };
    }

    const currentTime = Date.now();

    // Add to history
    this.poseHistory.push({ landmarks, timestamp: currentTime });
    if (this.poseHistory.length > 30) {
      this.poseHistory.shift();
    }

    // Need at least 2 frames for velocity calculation
    if (this.poseHistory.length < 2) {
      return { fallDetected: false, confidence: 0, isOnGround: false };
    }

    const previous = this.poseHistory[this.poseHistory.length - 2];
    const deltaTime = (currentTime - previous.timestamp) / 1000; // in seconds

    const velocities = this.calculateVelocities(
      landmarks,
      previous.landmarks,
      deltaTime
    );
    this.velocityHistory.push(velocities);
    if (this.velocityHistory.length > 30) {
      this.velocityHistory.shift();
    }

    // Check if person is on ground
    const wasOnGround = this.isOnGround;
    this.isOnGround = this.isPersonOnGround(landmarks);

    // Check for rapid descent (fall initiation)
    const rapidDescent =
      velocities.noseVelocity > CONFIG.VELOCITY_THRESHOLD ||
      velocities.hipVelocity > CONFIG.VELOCITY_THRESHOLD;

    // Fall detection logic
    let fallDetected = false;
    let confidence = 0;

    // Scenario 1: Rapid descent followed by being on ground
    if (rapidDescent && this.isOnGround && !wasOnGround) {
      this.fallStartTime = currentTime;
      confidence = Math.min(velocities.hipVelocity * 100, 90);
    }

    // Scenario 2: Confirmed fall - been on ground for confirmation time
    if (this.isOnGround && this.fallStartTime) {
      const timeOnGround = currentTime - this.fallStartTime;
      if (timeOnGround >= CONFIG.CONFIRMATION_TIME) {
        fallDetected = true;
        confidence = Math.min(
          95 + (timeOnGround / 1000) * 2,
          99
        );
      } else {
        confidence = (timeOnGround / CONFIG.CONFIRMATION_TIME) * 80;
      }
    }

    // Check for false positive - user stood up
    if (!this.isOnGround && wasOnGround) {
      if (this.fallStartTime) {
        const timeSinceFall = currentTime - this.fallStartTime;
        if (timeSinceFall < CONFIG.FALSE_POSITIVE_TIME) {
          // False positive - reset
          this.fallStartTime = null;
          fallDetected = false;
          confidence = 0;
        }
      }
      this.lastStandingTime = currentTime;
    }

    // Reset if person has been standing for a while
    if (!this.isOnGround && currentTime - this.lastStandingTime > 3000) {
      this.fallStartTime = null;
    }

    return {
      fallDetected,
      confidence,
      isOnGround: this.isOnGround,
      velocities,
    };
  }

  // Reset detection state
  reset(): void {
    this.fallStartTime = null;
    this.isOnGround = false;
    this.poseHistory = [];
    this.velocityHistory = [];
  }

  // Get detection statistics
  getStats(): {
    isCalibrated: boolean;
    initialHeight: number;
    isOnGround: boolean;
    historyLength: number;
  } {
    return {
      isCalibrated: this.isCalibrated,
      initialHeight: this.initialHeight,
      isOnGround: this.isOnGround,
      historyLength: this.poseHistory.length,
    };
  }
}

// Create singleton instance
export const fallDetectionService = new FallDetectionService();
