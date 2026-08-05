import { useState } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FallEvent } from '@/types';

interface DemoModeProps {
  onSimulateFall: () => void;
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
  fallHistory: FallEvent[];
}

export function DemoMode({
  onSimulateFall,
  isMonitoring,
  onToggleMonitoring,
  fallHistory,
}: DemoModeProps) {
  const [showDemoPanel, setShowDemoPanel] = useState(true);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="w-full max-w-[480px] pointer-events-auto px-4 pb-4">
        {/* Demo Toggle Button */}
        <div className="flex justify-center mb-0">
          <button
            onClick={() => setShowDemoPanel((prev) => !prev)}
            className="bg-[#1A202C] text-white px-4 py-1.5 rounded-t-xl text-xs font-medium flex items-center gap-2 shadow-lg"
          >
            <Activity className="w-3.5 h-3.5" />
            Demo Mode
            <span className="text-[10px] bg-[#FF6B00] px-2 py-0.5 rounded-full">
              {showDemoPanel ? 'Hide' : 'Show'}
            </span>
          </button>
        </div>

        {/* Demo Panel */}
        {showDemoPanel && (
          <div className="bg-[#1A202C] rounded-2xl p-3 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-sm">Demo Controls</h3>
                  <p className="text-gray-400 text-[10px] truncate">
                    Simulate fall detection for presentation
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-gray-400 text-[10px]">Events:</span>
                <span className="bg-[#0056D2] text-white px-2 py-0.5 rounded-full text-xs font-bold">
                  {fallHistory.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Start/Stop Monitoring */}
              <Button
                onClick={onToggleMonitoring}
                variant="outline"
                className={`h-12 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 ${isMonitoring
                    ? 'border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10'
                    : 'border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10'
                  }`}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span className="text-[10px]">Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span className="text-[10px]">Start</span>
                  </>
                )}
              </Button>

              {/* Simulate Fall */}
              <Button
                onClick={onSimulateFall}
                disabled={!isMonitoring}
                className="h-12 rounded-xl bg-[#FF6B00] hover:bg-[#E66000] text-white flex flex-col items-center justify-center gap-0.5 disabled:opacity-50"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="text-[10px]">Simulate</span>
              </Button>

              {/* Reset */}
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="h-12 rounded-xl border-2 border-gray-600 text-gray-400 hover:bg-gray-800 flex flex-col items-center justify-center gap-0.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-[10px]">Reset</span>
              </Button>
            </div>

            {/* Workflow */}
            <div className="mt-3 p-2.5 bg-gray-800 rounded-xl">
              <p className="text-gray-400 text-[10px] mb-1.5 font-semibold">
                Workflow:
              </p>
              <ol className="text-gray-300 text-[10px] space-y-0.5 list-decimal list-inside leading-relaxed">
                <li>Start monitoring - show "Monitoring Active" pulse</li>
                <li>Click "Simulate Fall" - demonstrate alert countdown</li>
                <li>Show "I'm OK" cancellation or alert sent</li>
                <li>Switch to Dashboard - show fall history</li>
                <li>Highlight: "100% on-device, no video uploaded"</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
