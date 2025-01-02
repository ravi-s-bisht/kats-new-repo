'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Camera, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepProgress from "@/components/health-check/StepProgress";
import VitalsDisplay from "@/components/health-check/VitalsDisplay";
import VideoCheckIn from "@/components/health-check/VideoCheckIn";
import { useAnalysis } from "@/lib/context";

const steps = [
  { id: 1, title: "Start Video", icon: Video },
  { id: 2, title: "Video Check", icon: Camera },
  { id: 3, title: "Complete", icon: Check },
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const { analysisData, isAuthenticated } = useAnalysis();
  const [showVideoCheck, setShowVideoCheck] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    // Short timeout just to show the loading state
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        <div className="text-center px-2 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            Medical Video Verification
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Complete your secure video verification process. This helps us
            analyze your vital signs and general well-being through a 30-second
            video recording.
          </p>
        </div>

        <div className="px-2 sm:px-0">
          <StepProgress steps={steps} currentStep={currentStep} />
        </div>

        <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm border border-gray-100">
          <div className="space-y-4 sm:space-y-6">
            {currentStep === 1 && (
              <div className="text-center">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Start Your Video Verification
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  {`Click the button below to begin. Ensure you're in a well-lit
                  area and your face is clearly visible.`}
                </p>
                <Button size="lg" onClick={startVideoCheck}>
                  Start Check-in
                </Button>
              </div>
            )}

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

            {currentStep === 3 && !isAnalyzing && analysisData && (
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
                    {`Here's your comprehensive health analysis.`}
                  </p>
                </div>

                <VitalsDisplay data={analysisData} />

                <div className="flex justify-center">
                  <Button onClick={handleReset}>Start New Analysis</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-xs sm:text-sm text-gray-600 px-2 sm:px-0">
          Need assistance? Our support team is available 24/7 to help you with
          the verification process.
        </div>
      </div>

      {showVideoCheck && <VideoCheckIn onComplete={handleVideoComplete} />}
    </div>
  );
}
