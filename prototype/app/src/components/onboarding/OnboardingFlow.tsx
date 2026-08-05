import { useState } from 'react';
import { Camera, MapPin, Users, ChevronRight, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CaregiverInfo } from '@/types';

interface OnboardingFlowProps {
  onComplete: (caregiver: CaregiverInfo) => void;
}

type OnboardingStep = 'permissions' | 'caregiver-setup' | 'ready';

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('permissions');
  const [permissions, setPermissions] = useState({
    camera: false,
    location: false,
    contacts: false,
  });
  const [caregiver, setCaregiver] = useState<CaregiverInfo>({
    name: '',
    phoneNumber: '',
  });

  const handlePermissionToggle = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNext = () => {
    if (currentStep === 'permissions') {
      setCurrentStep('caregiver-setup');
    } else if (currentStep === 'caregiver-setup') {
      if (caregiver.name && caregiver.phoneNumber) {
        setCurrentStep('ready');
      }
    } else if (currentStep === 'ready') {
      onComplete(caregiver);
    }
  };

  const isNextEnabled = () => {
    if (currentStep === 'permissions') {
      return permissions.camera;
    }
    if (currentStep === 'caregiver-setup') {
      return caregiver.name.length > 0 && caregiver.phoneNumber.length >= 10;
    }
    return true;
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-sg-gradient flex flex-col">
      {/* Header */}
      <div className="pt-safe px-4 py-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0056D2] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#1A202C]">
            Smart<span className="text-[#0056D2]">Guard</span>
          </span>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="px-4 mb-5 flex-shrink-0">
        <div className="flex gap-2">
          <div
            className={`h-1.5 flex-1 rounded-full transition-colors ${currentStep === 'permissions' ? 'bg-[#0056D2]' : 'bg-[#0056D2]'
              }`}
          />
          <div
            className={`h-1.5 flex-1 rounded-full transition-colors ${currentStep === 'caregiver-setup' || currentStep === 'ready'
                ? 'bg-[#0056D2]'
                : 'bg-gray-200'
              }`}
          />
          <div
            className={`h-1.5 flex-1 rounded-full transition-colors ${currentStep === 'ready' ? 'bg-[#0056D2]' : 'bg-gray-200'
              }`}
          />
        </div>
      </div>

      {/* Content — Scrollable */}
      <div className="flex-1 px-4 overflow-y-auto sg-scroll-area">
        {currentStep === 'permissions' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-[#1A202C] mb-2">
                Enable Permissions
              </h2>
              <p className="text-[#718096] text-base leading-relaxed">
                SmartGuard needs these permissions to keep you safe.
              </p>
            </div>

            <div className="space-y-3">
              {/* Camera Permission */}
              <button
                onClick={() => handlePermissionToggle('camera')}
                className={`w-full sg-card p-4 flex items-center gap-4 transition-all ${permissions.camera ? 'ring-2 ring-[#0056D2] bg-[#F0F7FF]' : ''
                  }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${permissions.camera ? 'bg-[#0056D2]' : 'bg-[#F5F7FA]'
                    }`}
                >
                  <Camera
                    className={`w-6 h-6 transition-colors ${permissions.camera ? 'text-white' : 'text-[#718096]'
                      }`}
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="font-semibold text-[#1A202C]">
                    Camera Access
                  </h3>
                  <p className="text-sm text-[#718096]">
                    Required for fall detection
                  </p>
                </div>
                {permissions.camera && (
                  <Check className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                )}
              </button>

              {/* Location Permission */}
              <button
                onClick={() => handlePermissionToggle('location')}
                className={`w-full sg-card p-4 flex items-center gap-4 transition-all ${permissions.location ? 'ring-2 ring-[#0056D2] bg-[#F0F7FF]' : ''
                  }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${permissions.location ? 'bg-[#0056D2]' : 'bg-[#F5F7FA]'
                    }`}
                >
                  <MapPin
                    className={`w-6 h-6 transition-colors ${permissions.location ? 'text-white' : 'text-[#718096]'
                      }`}
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="font-semibold text-[#1A202C]">
                    Location Access
                  </h3>
                  <p className="text-sm text-[#718096]">
                    Share location in emergencies
                  </p>
                </div>
                {permissions.location && (
                  <Check className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                )}
              </button>

              {/* Contacts Permission */}
              <button
                onClick={() => handlePermissionToggle('contacts')}
                className={`w-full sg-card p-4 flex items-center gap-4 transition-all ${permissions.contacts ? 'ring-2 ring-[#0056D2] bg-[#F0F7FF]' : ''
                  }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${permissions.contacts ? 'bg-[#0056D2]' : 'bg-[#F5F7FA]'
                    }`}
                >
                  <Users
                    className={`w-6 h-6 transition-colors ${permissions.contacts ? 'text-white' : 'text-[#718096]'
                      }`}
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="font-semibold text-[#1A202C]">
                    Contacts Access
                  </h3>
                  <p className="text-sm text-[#718096]">
                    Add caregiver easily
                  </p>
                </div>
                {permissions.contacts && (
                  <Check className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                )}
              </button>
            </div>

            {/* Privacy note */}
            <div className="sg-privacy-badge">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs">100% On-device processing. No video uploaded.</span>
            </div>
          </div>
        )}

        {currentStep === 'caregiver-setup' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-[#1A202C] mb-2">
                Add Caregiver
              </h2>
              <p className="text-[#718096] text-base leading-relaxed">
                Who should we contact in case of a fall?
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A202C] mb-2">
                  Caregiver Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Divyanshu"
                  value={caregiver.name}
                  onChange={(e) =>
                    setCaregiver((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="h-14 text-lg rounded-xl border-gray-200 focus:border-[#0056D2] focus:ring-[#0056D2] w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A202C] mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+91 99999 99999"
                  value={caregiver.phoneNumber}
                  onChange={(e) =>
                    setCaregiver((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  className="h-14 text-lg rounded-xl border-gray-200 focus:border-[#0056D2] focus:ring-[#0056D2] w-full"
                />
                <p className="mt-2 text-sm text-[#718096]">
                  We'll send WhatsApp alerts to this number
                </p>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'ready' && (
          <div className="text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-[#ECFDF5] flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-[#10B981]" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A202C] mb-2">
                You're All Set!
              </h2>
              <p className="text-[#718096] text-base leading-relaxed">
                SmartGuard is ready to protect you.
              </p>
            </div>

            <div className="sg-card p-4 text-left">
              <h3 className="font-semibold text-[#1A202C] mb-3 text-sm">
                What happens next?
              </h3>
              <ul className="space-y-3 text-[#718096] text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0056D2]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-[#0056D2]">1</span>
                  </div>
                  <span>Position your phone camera to see your activity area</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0056D2]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-[#0056D2]">2</span>
                  </div>
                  <span>Tap "Start Monitoring" to begin protection</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0056D2]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-[#0056D2]">3</span>
                  </div>
                  <span>If a fall is detected, we'll alert your caregiver</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer — Fixed */}
      <div className="p-4 pb-safe flex-shrink-0">
        <Button
          onClick={handleNext}
          disabled={!isNextEnabled()}
          className="w-full sg-button-primary flex items-center justify-center gap-2"
        >
          {currentStep === 'ready' ? 'Start Using SmartGuard' : 'Continue'}
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
