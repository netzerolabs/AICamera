import { useEffect, useRef } from 'react';
import { AlertTriangle, Phone, X, Activity, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundService } from '@/services/SoundService';

// Type augmentation for SpeechRecognition
type SpeechRecognitionType = EventTarget & {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null;
  start(): void;
  stop(): void;
};

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognitionType;
  }
}

interface AlertModalProps {
  isOpen: boolean;
  countdownValue: number;
  confidence: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export function AlertModal({
  isOpen,
  countdownValue,
  confidence,
  onCancel,
  onConfirm,
}: AlertModalProps) {
  const hasSpokenRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      // Play alert sound
      soundService.playAlertSound();

      // Speak alert message (only once)
      if (!hasSpokenRef.current) {
        hasSpokenRef.current = true;
        soundService.speak(
          'Fall detected. Are you okay? Press I am okay to cancel the alert.',
          () => {
            // Enable speech recognition after speaking
            if ('webkitSpeechRecognition' in window) {
              const recognition = new window.webkitSpeechRecognition();
              recognition.lang = 'en-US';
              recognition.continuous = false;
              recognition.interimResults = false;

              recognition.onresult = (event: { results: SpeechRecognitionResultList }) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                if (transcript.includes('yes') || transcript.includes('okay') || transcript.includes('fine')) {
                  onCancel();
                }
              };

              recognition.start();
            }
          }
        );
      }

      // Play tick sound on each second
      soundService.playTick();
    } else {
      hasSpokenRef.current = false;
      soundService.stopSpeaking();
    }
  }, [isOpen, countdownValue, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Alert Card */}
      <div className="relative w-full max-w-[440px] mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden animate-sg-shake max-h-[90vh] overflow-y-auto">
        {/* Header - Alert Color */}
        <div className="bg-[#FF6B00] p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Fall Detected!</h2>
                <p className="text-white/80">Possible emergency</p>
              </div>
            </div>
          </div>

          {/* Confidence Badge */}
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 w-fit">
            <Activity className="w-4 h-4" />
            <span className="font-semibold">{confidence.toFixed(0)}% Confidence</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Countdown */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#FFF7ED] border-4 border-[#FF6B00] mb-3 animate-sg-countdown">
              <span className="text-4xl font-bold text-[#FF6B00]">
                {countdownValue}
              </span>
            </div>
            <p className="text-[#718096] flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              Seconds until alert is sent
            </p>
          </div>

          {/* Message */}
          <div className="bg-[#FEF3C7] rounded-xl p-4 mb-6">
            <p className="text-[#92400E] text-center font-medium">
              If you don't respond, we'll alert your caregiver automatically.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={onCancel}
              className="w-full h-16 rounded-full bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xl flex items-center justify-center gap-3 shadow-lg"
            >
              <X className="w-6 h-6" />
              I'm OK - Cancel Alert
            </Button>

            <Button
              onClick={onConfirm}
              variant="outline"
              className="w-full h-14 rounded-full border-2 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10 font-semibold text-lg flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Send Help Now
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-xs text-center text-[#A0AEC0]">
            SmartGuard AI has detected a potential fall based on rapid movement
            and body position analysis.
          </p>
        </div>
      </div>
    </div>
  );
}
