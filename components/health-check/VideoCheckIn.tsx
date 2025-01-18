'use client';

import { useState, useEffect, useRef } from "react";
import VideoStream from "./VideoStream";
import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { useAnalysis } from "@/src/lib/context";

interface RealTimeVital {
  icon: any;
  label: string;
  value: string | number;
  unit: string;
  color: string;
}

interface VideoCheckInProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export interface AverageFinalReport {
  averageHeartRate: number | null;
  averageBloodPressure: string | null;
  averageHRV: number | null;
  averageBloodGlucose: number | null;
  confidence: number;
  totalReadings: number;
}

export default function VideoCheckIn({ onComplete, onCancel }: VideoCheckInProps) {
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [heartRate, setHeartRate] = useState<string | number>("--");
  const { setAnalysisData } = useAnalysis();
  const lastUpdateRef = useRef<{ time: number; value: string | number }>({ time: 0, value: "--" });

  const handleStreamComplete = (finalReport: AverageFinalReport) => {
    setIsStreamActive(false);
    setAnalysisData({
      heartRate: finalReport.averageHeartRate,
      bp: finalReport.averageBloodPressure,
      hrv: finalReport.averageHRV,
      bloodGlucose: finalReport.averageBloodGlucose,
      depressionProbability: finalReport.confidence
    });
    onComplete?.();
  };

  const handleStreamStart = (stream: MediaStream | null) => {
    setIsStreamActive(!!stream);
    if (!stream) {
      setHeartRate("--");
    }
  };

  const isSignificantChange = (newValue: string | number) => {
    const lastUpdate = lastUpdateRef.current;
    const now = Date.now();

    // Only update if enough time has passed and there's a significant change
    if (now - lastUpdate.time < 200) return false;

    if (typeof newValue === 'number' && typeof lastUpdate.value === 'number') {
      return Math.abs(newValue - lastUpdate.value) > 1;
    }
    return true;
  };

  const handleVitalsUpdate = (vitals: {
    heartRate: number;
    bloodPressure: string;
    hrv: number;
    bloodGlucose: number;
  }) => {
    const newHeartRate = vitals.heartRate > 0 ? vitals.heartRate : "--";

    if (isSignificantChange(newHeartRate)) {
      lastUpdateRef.current = {
        time: Date.now(),
        value: newHeartRate
      };
      setHeartRate(newHeartRate);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-0 sm:p-4 z-50">
      <div className="w-[400px] h-full sm:h-auto sm:max-w-5xl bg-black rounded-lg overflow-hidden relative">
        <div className="h-full sm:h-auto sm:aspect-video relative">
          {/* <VideoStream
            onStreamStart={handleStreamStart}
            onComplete={handleStreamComplete}
            onVitalsUpdate={handleVitalsUpdate}
            onCancel={onCancel}
          /> */}

          {/* <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2">
            <Card className="bg-black/50 backdrop-blur-sm border-none">
              <div className="p-1.5 sm:p-3 flex items-center gap-1.5 sm:gap-2">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-xs font-medium text-gray-400 truncate">
                    Heart Rate
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-white truncate">
                    {heartRate} {heartRate !== "--" ? "BPM" : ""}
                  </div>
                </div>
              </div>
            </Card>
          </div> */}
        </div>
      </div>
    </div>
  );
}