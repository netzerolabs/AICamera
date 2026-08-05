import { useEffect, useState } from 'react';
import { Shield, Heart, Activity } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`min-h-screen bg-white flex flex-col items-center justify-center px-6 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Logo Animation */}
      <div className="relative mb-8">
        {/* Outer pulse rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-[#0056D2]/10 animate-sg-pulse" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-32 h-32 rounded-full bg-[#0056D2]/10 animate-sg-pulse"
            style={{ animationDelay: '0.5s' }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-32 h-32 rounded-full bg-[#0056D2]/10 animate-sg-pulse"
            style={{ animationDelay: '1s' }}
          />
        </div>

        {/* Main logo */}
        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[#0056D2] to-[#004bb8] flex items-center justify-center shadow-xl">
          <Shield className="w-16 h-16 text-white" strokeWidth={2.5} />
        </div>

        {/* Floating icons */}
        <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center shadow-lg animate-bounce">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div
          className="absolute -bottom-2 -left-2 w-10 h-10 rounded-full bg-[#FF6B00] flex items-center justify-center shadow-lg animate-bounce"
          style={{ animationDelay: '0.3s' }}
        >
          <Activity className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Brand Name */}
      <h1 className="text-4xl font-bold text-[#1A202C] mb-3 tracking-tight">
        Smart<span className="text-[#0056D2]">Guard</span>
      </h1>

      {/* Tagline */}
      <p className="text-xl text-[#718096] text-center mb-2">
        Just Safety. No Wearables.
      </p>

      {/* Sub-tagline */}
      <p className="text-base text-[#A0AEC0] text-center">
        AI-Powered Fall Detection
      </p>

      {/* Loading indicator */}
      <div className="mt-12 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#0056D2] animate-bounce" />
        <div
          className="w-2 h-2 rounded-full bg-[#0056D2] animate-bounce"
          style={{ animationDelay: '0.1s' }}
        />
        <div
          className="w-2 h-2 rounded-full bg-[#0056D2] animate-bounce"
          style={{ animationDelay: '0.2s' }}
        />
      </div>
    </div>
  );
}
