import { useState, useCallback } from 'react';
import type { Results } from '@mediapipe/pose';
import { SplashScreen } from '@/components/onboarding/SplashScreen';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { MonitoringScreen } from '@/components/monitoring/MonitoringScreen';
import { AlertModal } from '@/components/alert/AlertModal';
import { CaregiverDashboard } from '@/components/dashboard/CaregiverDashboard';
import { DemoMode } from '@/components/demo/DemoMode';
import { useMediaPipe } from '@/hooks/useMediaPipe';
import { useFallDetection } from '@/hooks/useFallDetection';
import { soundService } from '@/services/SoundService';
import type { AppView, CaregiverInfo, FallEvent, UserSettings } from '@/types';
import { Toaster, toast } from 'sonner';

function App() {
  // App state
  const [currentView, setCurrentView] = useState<AppView>('splash');
  const [userSettings, setUserSettings] = useState<UserSettings>({
    caregiver: { name: '', phoneNumber: '' },
    cameraEnabled: false,
    locationEnabled: false,
    soundEnabled: true,
    voiceEnabled: true,
  });
  const [fallHistory, setFallHistory] = useState<FallEvent[]>([]);

  // Initialize MediaPipe
  const { videoRef, canvasRef, error, startCamera, stopCamera } =
    useMediaPipe({
      onResults: handlePoseResults,
      enabled: true,
    });

  // Initialize fall detection
  const {
    state: fallState,
    handlePoseResults: processPoseResults,
    cancelFall,
    confirmFall,
    startMonitoring,
    stopMonitoring,
    resetDetection,
  } = useFallDetection({
    onFallDetected: handleFallDetected,
    onCountdownComplete: handleCountdownComplete,
    enabled: true,
  });

  // Handle pose results from MediaPipe
  function handlePoseResults(results: Results) {
    processPoseResults(results);
  }

  // Handle fall detection event
  function handleFallDetected(event: FallEvent) {
    setFallHistory((prev) => [event, ...prev]);

    if (userSettings.soundEnabled) {
      soundService.playAlertSound();
    }

    if (userSettings.voiceEnabled) {
      soundService.speak(
        'Fall detected. Are you okay? Say yes or press the button to cancel.'
      );
    }

    toast.error('Fall detected!', {
      description: `Confidence: ${event.confidence.toFixed(0)}%`,
    });
  }

  // Handle countdown completion
  function handleCountdownComplete() {
    // Send alert to caregiver (simulated)
    const alertMessage = `🚨 SMARTGUARD ALERT\n\nA fall has been detected!\n\nTime: ${new Date().toLocaleString()}\nConfidence: ${fallState.confidence.toFixed(0)}%\n\nLocation: https://maps.google.com/?q=28.6139,77.2090\n\nPlease check on them immediately.`;

    // In real implementation, this would call Twilio API
    console.log('Sending WhatsApp alert:', alertMessage);

    // Update fall history
    setFallHistory((prev) =>
      prev.map((event, index) =>
        index === 0 ? { ...event, status: 'alert_sent' as const } : event
      )
    );

    toast.success('Alert sent to caregiver!', {
      description: 'WhatsApp message delivered',
    });

    // Reset after alert
    setTimeout(() => {
      resetDetection();
    }, 3000);
  }

  // Event handlers
  const handleSplashComplete = useCallback(() => {
    setCurrentView('onboarding');
  }, []);

  const handleOnboardingComplete = useCallback((caregiver: CaregiverInfo) => {
    setUserSettings((prev) => ({ ...prev, caregiver }));
    setCurrentView('monitoring');
    toast.success('Setup complete!', {
      description: 'SmartGuard is ready to protect you.',
    });
  }, []);

  const handleStartMonitoring = useCallback(async () => {
    await startCamera();
    startMonitoring();
    soundService.resumeAudioContext();
    soundService.initializeVoices();
    toast.success('Monitoring started', {
      description: 'AI is now watching for falls.',
    });
  }, [startCamera, startMonitoring]);

  const handleStopMonitoring = useCallback(() => {
    stopMonitoring();
    stopCamera();
    toast.info('Monitoring stopped');
  }, [stopMonitoring, stopCamera]);

  const handleTriggerEmergency = useCallback(() => {
    // Manually trigger emergency alert
    const emergencyEvent: FallEvent = {
      id: Date.now().toString(),
      timestamp: new Date(),
      confidence: 100,
      status: 'detected',
    };

    setFallHistory((prev) => [emergencyEvent, ...prev]);

    // Simulate alert sent immediately
    setTimeout(() => {
      handleCountdownComplete();
    }, 1000);

    toast.error('Emergency alert triggered!', {
      description: 'Notifying caregiver immediately.',
    });
  }, []);

  const handleCancelFall = useCallback(() => {
    cancelFall();

    // Update fall history
    setFallHistory((prev) =>
      prev.map((event, index) =>
        index === 0 ? { ...event, status: 'cancelled' as const } : event
      )
    );

    toast.success('Alert cancelled', {
      description: "Glad you're okay!",
    });
  }, [cancelFall]);

  const handleSimulateFall = useCallback(() => {
    // Simulate a fall detection
    const simulatedEvent: FallEvent = {
      id: Date.now().toString(),
      timestamp: new Date(),
      confidence: 95,
      status: 'detected',
    };

    setFallHistory((prev) => [simulatedEvent, ...prev]);

    // Trigger fall detection state
    handleFallDetected(simulatedEvent);
  }, []);

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'splash':
        return <SplashScreen onComplete={handleSplashComplete} />;

      case 'onboarding':
        return <OnboardingFlow onComplete={handleOnboardingComplete} />;

      case 'monitoring':
        return (
          <>
            <MonitoringScreen
              isMonitoring={fallState.isMonitoring}
              caregiver={userSettings.caregiver}
              videoRef={videoRef}
              canvasRef={canvasRef}
              cameraError={error}
              onStartMonitoring={handleStartMonitoring}
              onStopMonitoring={handleStopMonitoring}
              onTriggerEmergency={handleTriggerEmergency}
              onOpenSettings={() => toast.info('Settings coming soon!')}
              onSwitchToDashboard={() => setCurrentView('dashboard')}
            />

            {/* Alert Modal */}
            <AlertModal
              isOpen={fallState.countdownActive}
              countdownValue={fallState.countdownValue}
              confidence={fallState.confidence}
              onCancel={handleCancelFall}
              onConfirm={confirmFall}
            />

            {/* Demo Mode Controls */}
            <DemoMode
              onSimulateFall={handleSimulateFall}
              isMonitoring={fallState.isMonitoring}
              onToggleMonitoring={
                fallState.isMonitoring
                  ? handleStopMonitoring
                  : handleStartMonitoring
              }
              fallHistory={fallHistory}
            />
          </>
        );

      case 'dashboard':
        return (
          <CaregiverDashboard
            fallHistory={fallHistory}
            caregiver={userSettings.caregiver}
            isMonitoring={fallState.isMonitoring}
            onBack={() => setCurrentView('monitoring')}
          />
        );

      default:
        return <SplashScreen onComplete={handleSplashComplete} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <div className="sg-app-container bg-white">
        <Toaster position="top-center" richColors />
        {renderView()}
      </div>
    </div>
  );
}

export default App;
