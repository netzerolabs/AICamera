import { useState } from 'react';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Clock,
  Activity,
  CheckCircle,
  AlertTriangle,
  Calendar,
  TrendingDown,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FallEvent, CaregiverInfo } from '@/types';

interface CaregiverDashboardProps {
  fallHistory: FallEvent[];
  caregiver: CaregiverInfo;
  isMonitoring: boolean;
  onBack: () => void;
}

export function CaregiverDashboard({
  fallHistory,
  caregiver,
  isMonitoring,
  onBack,
}: CaregiverDashboardProps) {
  const [selectedEvent, setSelectedEvent] = useState<FallEvent | null>(null);

  const getStatusColor = (status: FallEvent['status']) => {
    switch (status) {
      case 'detected':
        return 'text-[#FF6B00] bg-[#FFF7ED]';
      case 'cancelled':
        return 'text-[#10B981] bg-[#ECFDF5]';
      case 'alert_sent':
        return 'text-[#EF4444] bg-[#FEF2F2]';
      default:
        return 'text-[#718096] bg-[#F5F7FA]';
    }
  };

  const getStatusIcon = (status: FallEvent['status']) => {
    switch (status) {
      case 'detected':
        return <AlertTriangle className="w-4 h-4" />;
      case 'cancelled':
        return <CheckCircle className="w-4 h-4" />;
      case 'alert_sent':
        return <Phone className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: FallEvent['status']) => {
    switch (status) {
      case 'detected':
        return 'Detected';
      case 'cancelled':
        return 'Cancelled';
      case 'alert_sent':
        return 'Alert Sent';
      default:
        return 'Unknown';
    }
  };

  const stats = {
    totalFalls: fallHistory.length,
    alertsSent: fallHistory.filter((e) => e.status === 'alert_sent').length,
    cancelled: fallHistory.filter((e) => e.status === 'cancelled').length,
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-sg-gradient flex flex-col overflow-hidden">
      {/* Header */}
      <div className="pt-safe px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#F5F7FA] flex items-center justify-center hover:bg-[#E8ECF0] transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-[#718096]" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-[#1A202C] truncate">Caregiver Dashboard</h1>
          <p className="text-xs text-[#718096]">Monitor fall detection activity</p>
        </div>
      </div>

      {/* Main Content — Scrollable */}
      <div className="flex-1 px-4 pb-6 overflow-y-auto sg-scroll-area space-y-4">
        {/* Status Card */}
        <div className="sg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isMonitoring ? 'bg-[#10B981]' : 'bg-[#718096]'
                  }`}
              >
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#718096]">Device Status</p>
                <p
                  className={`font-semibold ${isMonitoring ? 'text-[#10B981]' : 'text-[#718096]'
                    }`}
                >
                  {isMonitoring ? 'Monitoring Active' : 'Not Monitoring'}
                </p>
              </div>
            </div>
            <div
              className={`w-3 h-3 rounded-full flex-shrink-0 ${isMonitoring ? 'bg-[#10B981] animate-pulse' : 'bg-[#718096]'
                }`}
            />
          </div>

          {/* Caregiver Info */}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-[#718096] mb-2">Emergency Contact</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#0056D2]/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-[#0056D2]" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#1A202C] text-sm truncate">{caregiver.name}</p>
                <p className="text-xs text-[#718096] truncate">{caregiver.phoneNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="sg-card p-3 text-center">
            <p className="text-xl font-bold text-[#1A202C]">{stats.totalFalls}</p>
            <p className="text-[10px] text-[#718096] leading-tight mt-1">Total Events</p>
          </div>
          <div className="sg-card p-3 text-center">
            <p className="text-xl font-bold text-[#EF4444]">{stats.alertsSent}</p>
            <p className="text-[10px] text-[#718096] leading-tight mt-1">Alerts Sent</p>
          </div>
          <div className="sg-card p-3 text-center">
            <p className="text-xl font-bold text-[#10B981]">{stats.cancelled}</p>
            <p className="text-[10px] text-[#718096] leading-tight mt-1">Cancelled</p>
          </div>
        </div>

        {/* Fall History */}
        <div>
          <h2 className="text-base font-bold text-[#1A202C] mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0056D2]" />
            Fall History
          </h2>

          {fallHistory.length === 0 ? (
            <div className="sg-card p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[#ECFDF5] flex items-center justify-center mx-auto mb-3">
                <TrendingDown className="w-7 h-7 text-[#10B981]" />
              </div>
              <h3 className="text-base font-semibold text-[#1A202C] mb-1">
                No Falls Detected
              </h3>
              <p className="text-sm text-[#718096]">
                Great news! No fall events have been recorded yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {fallHistory.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="w-full sg-card p-3 text-left hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(
                          event.status
                        )}`}
                      >
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1A202C] text-sm">
                          Fall Detected
                        </p>
                        <p className="text-xs text-[#718096] flex items-center gap-1 truncate">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          {event.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                          event.status
                        )}`}
                      >
                        {getStatusText(event.status)}
                      </span>
                      <p className="text-xs text-[#718096] mt-0.5">
                        {event.confidence.toFixed(0)}% confidence
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          />
          <div className="relative w-full max-w-[440px] mx-4 bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#1A202C]">Event Details</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="w-8 h-8 rounded-full bg-[#F5F7FA] flex items-center justify-center hover:bg-[#E8ECF0] transition-colors"
                >
                  <span className="text-[#718096] text-sm">✕</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusColor(
                      selectedEvent.status
                    )}`}
                  >
                    {getStatusIcon(selectedEvent.status)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1A202C]">
                      {getStatusText(selectedEvent.status)}
                    </p>
                    <p className="text-sm text-[#718096] truncate">
                      {selectedEvent.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="sg-card p-3">
                  <p className="text-xs text-[#718096] mb-1">Detection Confidence</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-[#F5F7FA] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0056D2] rounded-full transition-all"
                        style={{ width: `${selectedEvent.confidence}%` }}
                      />
                    </div>
                    <span className="font-bold text-[#1A202C] text-sm">
                      {selectedEvent.confidence.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="sg-card p-3">
                    <p className="text-xs text-[#718096] mb-2">Location</p>
                    <div className="flex items-center gap-2 text-[#1A202C] text-sm">
                      <MapPin className="w-4 h-4 text-[#0056D2] flex-shrink-0" />
                      <span className="truncate">
                        {selectedEvent.location.latitude.toFixed(6)},{' '}
                        {selectedEvent.location.longitude.toFixed(6)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-3 rounded-full text-sm h-10"
                      onClick={() => {
                        if (selectedEvent.location) {
                          window.open(
                            `https://maps.google.com/?q=${selectedEvent.location.latitude},${selectedEvent.location.longitude}`,
                            '_blank'
                          );
                        }
                      }}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Open in Maps
                    </Button>
                  </div>
                )}

                {selectedEvent.skeletonData && (
                  <div className="sg-card p-3">
                    <p className="text-xs text-[#718096] mb-2">Skeleton Replay</p>
                    <div className="bg-black rounded-xl aspect-video flex items-center justify-center overflow-hidden">
                      <canvas
                        ref={(canvas) => {
                          if (canvas && selectedEvent.skeletonData) {
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              canvas.width = 320;
                              canvas.height = 240;
                              drawSkeleton(ctx, selectedEvent.skeletonData);
                            }
                          }
                        }}
                        className="w-full h-full"
                      />
                    </div>
                    <p className="text-[10px] text-[#A0AEC0] mt-2 text-center">
                      Privacy-preserving skeleton view only
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Draw skeleton on canvas for replay
function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number; z: number; visibility?: number }[]
) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const connections = [
    [11, 12],
    [11, 23],
    [12, 24],
    [23, 24],
    [11, 13],
    [13, 15],
    [12, 14],
    [14, 16],
    [23, 25],
    [25, 27],
    [24, 26],
    [26, 28],
  ];

  ctx.strokeStyle = '#0056D2';
  ctx.lineWidth = 3;

  connections.forEach(([start, end]) => {
    const startPoint = landmarks[start];
    const endPoint = landmarks[end];

    if (startPoint && endPoint && (startPoint.visibility ?? 0) > 0.5) {
      ctx.beginPath();
      ctx.moveTo(startPoint.x * ctx.canvas.width, startPoint.y * ctx.canvas.height);
      ctx.lineTo(endPoint.x * ctx.canvas.width, endPoint.y * ctx.canvas.height);
      ctx.stroke();
    }
  });

  landmarks.forEach((landmark, index) => {
    if ((landmark.visibility ?? 0) > 0.5) {
      ctx.beginPath();
      ctx.arc(
        landmark.x * ctx.canvas.width,
        landmark.y * ctx.canvas.height,
        5,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = index === 0 ? '#FF6B00' : '#0056D2';
      ctx.fill();
    }
  });
}
