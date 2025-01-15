"use client";

export const runtime = "edge";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Video, Camera, Check, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepProgress from "@/components/health-check/StepProgress";
import VitalsDisplay, {
  VitalsData,
} from "@/components/health-check/VitalsDisplay";
import VideoCheckIn, {
  AverageFinalReport,
} from "@/components/health-check/VideoCheckIn";
import { useAnalysis } from "@/src/lib/context";
import AuthPrompt from "@/components/health-check/AuthPrompt";
import { useUser } from "@/src/contexts/UserContext";
import VideoStream from "@/components/health-check/VideoStream";

const steps = [
  {
    id: 1,
    title: "Start Video",
    icon: Video,
    description: "Begin secure video verification",
  },
  {
    id: 2,
    title: "Video Check",
    icon: Camera,
    description: "Position yourself for vital signs analysis",
  },
  {
    id: 3,
    title: "Complete",
    icon: Check,
    description: "Review your health analysis",
  },
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(2);
  const { user } = useUser();
  const { analysisData, isLoggedIn, setIsLoggedIn, setAnalysisData } =
    useAnalysis();
  const [showVideoCheck, setShowVideoCheck] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [heartRate, setHeartRate] = useState<string | number>("--");
  const lastUpdateRef = useRef<{ time: number; value: string | number }>({
    time: 0,
    value: "--",
  });

  const handleStreamComplete = (finalReport: AverageFinalReport) => {
    setIsStreamActive(false);
    setAnalysisData({
      heartRate: finalReport.averageHeartRate,
      bp: finalReport.averageBloodPressure,
      hrv: finalReport.averageHRV,
      bloodGlucose: finalReport.averageBloodGlucose,
      depressionProbability: finalReport.confidence,
    });
    handleVideoComplete?.();
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

    if (typeof newValue === "number" && typeof lastUpdate.value === "number") {
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
        value: newHeartRate,
      };
      setHeartRate(newHeartRate);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setShowVideoCheck(false);
    setIsAnalyzing(false);
  };

  const startVideoCheck = () => {
    setCurrentStep(2);
    setShowVideoCheck(true);
  };

  const handleVideoComplete = () => {
    setShowVideoCheck(false);
    setIsAnalyzing(true);
    setCurrentStep(3);
    setTimeout(() => {
      setIsAnalyzing(false);
      if (!isLoggedIn) {
        setShowAuthPrompt(true);
      }
    }, 1000);
  };

  const handleVideoCancel = () => {
    setShowVideoCheck(false);
    setCurrentStep(1);
  };

  const handleAuthSuccess = () => {
    setShowAuthPrompt(false);
  };

  useEffect(() => {
    const storedData = localStorage.getItem("analysisData");
    if (user && storedData) {
      try {
        const parsedData: VitalsData = JSON.parse(storedData);
        setAnalysisData(parsedData);
        localStorage.removeItem("analysisData"); // Clean up after loading
        handleAuthSuccess();
      } catch (error) {
        console.error("Error parsing stored analysis data:", error);
      }
    }

    if (!user) {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-start w-auto h-screen">
      {currentStep != 3 && (
        <VideoStream
          onStreamStart={handleStreamStart}
          onComplete={handleStreamComplete}
          onVitalsUpdate={handleVitalsUpdate}
          onCancel={handleVideoCancel}
          handleReset={handleReset}
        />
      )}

      {showAuthPrompt && <AuthPrompt onAuthSuccess={handleAuthSuccess} />}

      {isAnalyzing && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            Analyzing Your Results
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Please wait while we process your health data...
          </p>
        </div>
      )}

      {currentStep === 3 && !isAnalyzing && analysisData && !showAuthPrompt && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Check className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Analysis Complete
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Here{"'"}s your comprehensive health analysis. Our AI-powered
              system has analyzed your vital signs and health indicators.
            </p>
          </div>

          {isLoggedIn ? (
            <VitalsDisplay data={analysisData} handleReset={handleReset} />
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                Sign in to view your complete health analysis
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
