import { useState, useEffect } from "react";
import VideoStream from "./VideoStream";
import { Card } from "@/components/ui/card";
import { Activity, Heart, LineChart } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAnalysis } from "@/lib/context";
import AuthPrompt from "./AuthPrompt";

interface RealTimeVital {
  icon: any;
  label: string;
  value: string | number;
  unit: string;
  color: string;
}

interface VideoCheckInProps {
  onComplete?: () => void;
}

export default function VideoCheckIn({ onComplete }: VideoCheckInProps) {
  const [showAuth, setShowAuth] = useState(false);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [realTimeVitals, setRealTimeVitals] = useState<RealTimeVital[]>([
    {
      icon: Activity,
      label: "Blood Pressure",
      value: "--",
      unit: "mmHg",
      color: "text-blue-500"
    },
    {
      icon: Heart,
      label: "Heart Rate",
      value: "--",
      unit: "BPM",
      color: "text-red-500"
    },
    {
      icon: LineChart,
      label: "HRV",
      value: "--",
      unit: "ms",
      color: "text-green-500"
    }
  ]);

  const { setAnalysisData, isAuthenticated } = useAnalysis();

  // Simulate real-time vitals updates only when stream is active
  useEffect(() => {
    if (!isStreamActive) return;

    const interval = setInterval(() => {
      setRealTimeVitals(prev => prev.map(vital => ({
        ...vital,
        value: vital.label === "Blood Pressure" ? 
          `${Math.floor(110 + Math.random() * 20)}/${Math.floor(70 + Math.random() * 10)}` :
          Math.floor(60 + Math.random() * 40)
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreamActive]);

  const handleStreamComplete = () => {
    setIsStreamActive(false);
    // Store the final analysis data
    setAnalysisData({
      bp: "120/80",
      heartRate: 72,
      hrv: 65,
      bmi: 22.5,
      depressionProbability: 25
    });

    // If user is already authenticated, skip auth prompt
    if (isAuthenticated) {
      onComplete?.();
    } else {
      setShowAuth(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    onComplete?.();
  };

  const handleStreamStart = (stream: MediaStream | null) => {
    setIsStreamActive(!!stream);
    // Reset vitals to placeholder values when stream stops
    if (!stream) {
      setRealTimeVitals(prev => prev.map(vital => ({
        ...vital,
        value: "--"
      })));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-0 sm:p-4 z-50">
      <div className="w-full h-full sm:h-auto sm:max-w-5xl bg-black rounded-lg overflow-hidden relative">
        <div className="h-full sm:h-auto sm:aspect-video relative">
          <VideoStream
            onStreamStart={handleStreamStart}
            onComplete={handleStreamComplete}
          />

          {/* Real-time vitals overlay - stacked vertically on left center */}
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

      {/* Auth prompt overlay */}
      {showAuth && <AuthPrompt onAuthSuccess={handleAuthSuccess} />}
    </div>
  );
}