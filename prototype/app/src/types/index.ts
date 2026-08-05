// SmartGuard Types

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface FallDetectionState {
  isMonitoring: boolean;
  fallDetected: boolean;
  countdownActive: boolean;
  countdownValue: number;
  lastFallTime: Date | null;
  confidence: number;
}

export interface CaregiverInfo {
  name: string;
  phoneNumber: string;
}

export interface UserSettings {
  caregiver: CaregiverInfo;
  cameraEnabled: boolean;
  locationEnabled: boolean;
  soundEnabled: boolean;
  voiceEnabled: boolean;
}

export interface FallEvent {
  id: string;
  timestamp: Date;
  confidence: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: 'detected' | 'cancelled' | 'alert_sent';
  skeletonData?: PoseLandmark[];
}

export interface AlertStatus {
  type: 'none' | 'fall_detected' | 'countdown' | 'alert_sent';
  message: string;
  countdown?: number;
}

export type AppView = 'splash' | 'onboarding' | 'setup' | 'monitoring' | 'alert' | 'dashboard';

export interface PoseData {
  landmarks: PoseLandmark[];
  timestamp: number;
}

export interface VelocityData {
  noseVelocity: number;
  hipVelocity: number;
  ankleVelocity: number;
  timestamp: number;
}

// Speech Recognition types are defined in AlertModal.tsx
