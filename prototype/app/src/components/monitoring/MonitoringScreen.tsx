import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Video,
  VideoOff,
  Settings,
  Phone,
  Power,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CaregiverInfo } from '@/types';

interface MonitoringScreenProps {
  isMonitoring: boolean;
  caregiver: CaregiverInfo;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  cameraError: string | null;
  onStartMonitoring: () => void;
  onStopMonitoring: () => void;
  onTriggerEmergency: () => void;
  onOpenSettings: () => void;
  onSwitchToDashboard: () => void;
}

export function MonitoringScreen({
  isMonitoring,
  caregiver,
  videoRef,
  canvasRef,
  cameraError,
  onStartMonitoring,
  onStopMonitoring,
  onTriggerEmergency,
  onOpenSettings,
  onSwitchToDashboard,
}: MonitoringScreenProps) {
  const [showCamera, setShowCamera] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleCamera = useCallback(() => {
    setShowCamera((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-sg-gradient flex flex-col">
      {/* Header */}
      <div className="pt-safe px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0056D2] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-[#1A202C]">
              Smart<span className="text-[#0056D2]">Guard</span>
            </span>
            <p className="text-xs text-[#718096]">
              {currentTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchToDashboard}
            className="w-10 h-10 rounded-full bg-[#F5F7FA] flex items-center justify-center hover:bg-[#E8ECF0] transition-colors"
          >
            <Eye className="w-5 h-5 text-[#718096]" />
          </button>
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-full bg-[#F5F7FA] flex items-center justify-center hover:bg-[#E8ECF0] transition-colors"
          >
            <Settings className="w-5 h-5 text-[#718096]" />
          </button>
        </div>
      </div>

      {/* Main Content — Scrollable */}
      <div className="flex-1 px-4 overflow-y-auto sg-scroll-area pb-4">
        {/* Status Card */}
        <div className="sg-card p-5 mb-4">
          {isMonitoring ? (
            <div className="text-center">
              {/* Active Monitoring Indicator */}
              <div className="relative w-28 h-28 mx-auto mb-4">
                {/* Pulse rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-[#10B981]/20 animate-ping" />
                </div>
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ animationDelay: '0.5s' }}
                >
                  <div className="w-20 h-20 rounded-full bg-[#10B981]/20 animate-ping" />
                </div>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#10B981] flex items-center justify-center shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold text-[#10B981] mb-1">
                Monitoring Active
              </h2>
              <p className="text-sm text-[#718096]">
                AI is watching for falls
              </p>

              {/* Stats */}
              <div className="flex justify-center gap-6 mt-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-[#1A202C]">99%</p>
                  <p className="text-xs text-[#718096]">Accuracy</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-[#1A202C]">&lt;2%</p>
                  <p className="text-xs text-[#718096]">Battery/hr</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-[#1A202C]">&lt;5s</p>
                  <p className="text-xs text-[#718096]">Alert time</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              {/* Inactive Indicator */}
              <div className="w-20 h-20 rounded-full bg-[#F5F7FA] flex items-center justify-center mx-auto mb-4">
                <VideoOff className="w-8 h-8 text-[#718096]" />
              </div>

              <h2 className="text-xl font-bold text-[#718096] mb-1">
                Not Monitoring
              </h2>
              <p className="text-sm text-[#A0AEC0]">
                Start to enable fall detection
              </p>
            </div>
          )}
        </div>

        {/* Camera Preview */}
        <div className="sg-card overflow-hidden mb-4">
          <button
            onClick={toggleCamera}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#F5F7FA] transition-colors"
          >
            <div className="flex items-center gap-3">
              {showCamera ? (
                <Video className="w-5 h-5 text-[#0056D2]" />
              ) : (
                <VideoOff className="w-5 h-5 text-[#718096]" />
              )}
              <span className="font-medium text-[#1A202C] text-sm">
                {showCamera ? 'Hide Camera Preview' : 'Show Camera Preview'}
              </span>
            </div>
            {showCamera ? (
              <EyeOff className="w-4 h-4 text-[#718096]" />
            ) : (
              <Eye className="w-4 h-4 text-[#718096]" />
            )}
          </button>

          {showCamera && (
            <div className="sg-camera-container">
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1A202C]">
                  <VideoOff className="w-10 h-10 text-[#718096] mb-3" />
                  <p className="text-[#718096] text-sm px-4 text-center">{cameraError}</p>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                  />
                  <canvas
                    ref={canvasRef}
                  />
                  {!isMonitoring && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <p className="text-white font-medium text-sm">
                        Start monitoring to activate AI
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Caregiver Info */}
        <div className="sg-card p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0056D2]/10 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-[#0056D2]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#718096]">Emergency Contact</p>
              <p className="font-semibold text-[#1A202C] truncate">
                {caregiver.name || 'Not set'}
              </p>
              <p className="text-xs text-[#718096] truncate">
                {caregiver.phoneNumber || 'No phone number'}
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Badge */}
        <div className="flex justify-center mb-4">
          <div className="sg-privacy-badge">
            <Shield className="w-4 h-4" />
            <span className="text-xs">Processing on Device. No Video Uploaded.</span>
          </div>
        </div>
      </div>

      {/* Footer Actions — Fixed at Bottom */}
      <div className="px-4 py-4 pb-safe space-y-3 flex-shrink-0 bg-white border-t border-gray-50">
        {isMonitoring ? (
          <Button
            onClick={onStopMonitoring}
            variant="outline"
            className="w-full h-14 rounded-full border-2 border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10 font-semibold text-lg flex items-center justify-center gap-2"
          >
            <Power className="w-5 h-5" />
            Stop Monitoring
          </Button>
        ) : (
          <Button
            onClick={onStartMonitoring}
            className="w-full sg-button-primary flex items-center justify-center gap-2"
          >
            <Video className="w-5 h-5" />
            Start Monitoring
          </Button>
        )}

        <Button
          onClick={onTriggerEmergency}
          variant="outline"
          className="w-full h-14 rounded-full border-2 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10 font-semibold text-lg flex items-center justify-center gap-2"
        >
          <Phone className="w-5 h-5" />
          HELP ME
        </Button>
      </div>
    </div>
  );
}
