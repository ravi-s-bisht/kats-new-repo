import { useState, useEffect, useRef } from "react";
import VideoStream from "./VideoStream";
import { Card } from "@/components/ui/card";
import { Activity, Heart, LineChart, Droplet } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAnalysis } from "@/src/lib/context";

interface RealTimeVital {
  icon: any;
  label: string;
  value: string | number;
  unit: string;
  color: string;
  lastUpdate?: number;
}

interface VideoCheckInProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function VideoCheckIn({ onComplete, onCancel }: VideoCheckInProps) {
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [realTimeVitals, setRealTimeVitals] = useState<RealTimeVital[]>([
    {
      icon: Heart,
      label: "Heart Rate",
      value: "--",
      unit: "BPM",
      color: "text-red-500"
    },
    {
      icon: Activity,
      label: "Blood Pressure",
      value: "--",
      unit: "mmHg",
      color: "text-blue-500"
    },
    {
      icon: LineChart,
      label: "HRV",
      value: "--",
      unit: "ms",
      color: "text-green-500"
    },
    {
      icon: Droplet,
      label: "Blood Glucose",
      value: "--",
      unit: "mg/dL",
      color: "text-purple-500"
    }
  ]);

  const lastUpdateRef = useRef<{ [key: string]: { time: number; value: string | number } }>({});
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { setAnalysisData } = useAnalysis();

  const handleStreamComplete = () => {
    setIsStreamActive(false);
    setAnalysisData({
      bp: realTimeVitals[1].value.toString(),
      heartRate: Number(realTimeVitals[0].value) || 0,
      hrv: realTimeVitals[2].value.toString(),
      bloodGlucose: realTimeVitals[3].value.toString(),
      depressionProbability: "--"
    });
    onComplete?.();
  };

  const handleStreamStart = (stream: MediaStream | null) => {
    setIsStreamActive(!!stream);
    if (!stream) {
      setRealTimeVitals(prev => prev.map(vital => ({
        ...vital,
        value: "--"
      })));
    }
  };

  const isSignificantChange = (label: string, newValue: string | number) => {
    const lastUpdate = lastUpdateRef.current[label];
    if (!lastUpdate) return true;

    const now = Date.now();
    // Reduce minimum update interval to 200ms for more frequent updates
    if (now - lastUpdate.time < 200) return false;

    // Check for significant changes based on vital type
    const oldValue = lastUpdate.value;
    if (typeof newValue === 'number' && typeof oldValue === 'number') {
      switch (label) {
        case 'Heart Rate':
          // Keep heart rate sensitivity as is
          return Math.abs(newValue - oldValue) > 1;
        case 'HRV':
          return Math.abs(newValue - oldValue) > 2;
        case 'Blood Glucose':
          return Math.abs(newValue - oldValue) > 1;
        default:
          return true;
      }
    } else if (label === 'Blood Pressure' && typeof newValue === 'string' && typeof oldValue === 'string') {
      const [oldSys, oldDia] = oldValue.split('/').map(Number);
      const [newSys, newDia] = newValue.split('/').map(Number);
      // Increase BP sensitivity by lowering thresholds
      return Math.abs(newSys - oldSys) > 1 || Math.abs(newDia - oldDia) > 1;
    }
    return true;
  };

  // Debounced update function
  const updateVitals = (updates: { label: string; value: string | number }[]) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      setRealTimeVitals(prev => prev.map(vital => {
        const update = updates.find(u => u.label === vital.label);
        if (!update || !isSignificantChange(vital.label, update.value)) {
          return vital;
        }

        // Update the last known value and time
        lastUpdateRef.current[vital.label] = {
          time: Date.now(),
          value: update.value
        };

        return {
          ...vital,
          value: update.value
        };
      }));
    }, 100); // Debounce time of 100ms
  };

  const handleVitalsUpdate = (vitals: {
    heartRate: number;
    bloodPressure: string;
    hrv: number;
    bloodGlucose: number;
  }) => {
    const updates = [
      { label: "Heart Rate", value: vitals.heartRate > 0 ? vitals.heartRate : "--" },
      { label: "Blood Pressure", value: vitals.bloodPressure !== "--" ? vitals.bloodPressure : "--" },
      { label: "HRV", value: vitals.hrv > 0 ? vitals.hrv : "--" },
      { label: "Blood Glucose", value: vitals.bloodGlucose > 0 ? vitals.bloodGlucose : "--" }
    ];

    // Immediately update if no previous values exist
    if (!Object.keys(lastUpdateRef.current).length) {
      setRealTimeVitals(prev => prev.map(vital => {
        const update = updates.find(u => u.label === vital.label);
        if (update) {
          lastUpdateRef.current[vital.label] = {
            time: Date.now(),
            value: update.value
          };
          return { ...vital, value: update.value };
        }
        return vital;
      }));
      return;
    }

    updateVitals(updates);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-0 sm:p-4 z-50">
      <div className="w-full h-full sm:h-auto sm:max-w-5xl bg-black rounded-lg overflow-hidden relative">
        <div className="h-full sm:h-auto sm:aspect-video relative">
          <VideoStream
            onStreamStart={handleStreamStart}
            onComplete={handleStreamComplete}
            onVitalsUpdate={handleVitalsUpdate}
            onCancel={onCancel}
          />

          <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 space-y-1.5 sm:space-y-2 max-w-[120px] sm:max-w-[160px]">
            {realTimeVitals.map((vital, index) => (
              <Card key={index} className="bg-black/50 backdrop-blur-sm border-none w-full">
                <div className="p-1.5 sm:p-3 flex items-center gap-1.5 sm:gap-2">
                  <vital.icon className={cn("w-3 h-3 sm:w-4 sm:h-4", vital.color)} />
                  <div className="min-w-0">
                    <div className="text-[10px] sm:text-xs font-medium text-gray-400 truncate">
                      {vital.label}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-white truncate">
                      {vital.value} {vital.value !== "--" ? vital.unit : ""}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}