'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import VideoStream from "@/components/health-check/VideoStream";
import { Video, Camera, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepProgress from "@/components/health-check/StepProgress";
import VitalsDisplay from "@/components/health-check/VitalsDisplay";

const steps = [
  { id: 1, title: "Start Video", icon: Video },
  { id: 2, title: "Video Check", icon: Camera },
  { id: 3, title: "Complete", icon: Check },
];

// Sample data - would be replaced with actual analysis results
const sampleVitalsData = {
  bp: "120/80",
  heartRate: 72,
  hrv: 65,
  bmi: 22.5,
  depressionProbability: 25,
};

export default function Home() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [vitalsData, setVitalsData] = useState<
    typeof sampleVitalsData | undefined
  >(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleVideoStart = (videoStream: MediaStream | null) => {
    console.log(
      "Video stream state changed:",
      videoStream ? "active" : "inactive"
    );
    setStream(videoStream);
    if (videoStream) {
      setCurrentStep(2); // Move to video check step when stream starts
    } else {
      setCurrentStep(1); // Reset to start step when stream stops
    }
  };

  const handleComplete = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCurrentStep(3);
    setIsAnalyzing(true);

    // Simulate API call delay - replace with actual API call
    setTimeout(() => {
      setVitalsData(sampleVitalsData);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setVitalsData(undefined);
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
            video recording. Your privacy is our priority - the video stream is
            secure and not recorded.
          </p>
        </div>

        <div className="px-2 sm:px-0">
          <StepProgress steps={steps} currentStep={currentStep} />
        </div>

        <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm border border-gray-100">
          <div className="space-y-4 sm:space-y-6">
            {/* Step instructions */}
            {currentStep === 1 && (
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Start Your Video Verification
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {`Click the "Start Camera" button below to begin. Ensure you're
                  in a well-lit area and your face is clearly visible.`}
                </p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Video Check in Progress
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Please remain still and speak naturally for 30 seconds while
                  we analyze your vital signs.
                </p>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 sm:space-y-8">
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
                    Your vital signs have been analyzed successfully. Review
                    your results below.
                  </p>
                </div>

                <VitalsDisplay data={vitalsData} isLoading={isAnalyzing} />

                <div className="flex justify-center pt-4 sm:pt-6">
                  <Button onClick={handleReset}>Start New Analysis</Button>
                </div>
              </div>
            )}

            {/* Video component */}
            {currentStep < 3 && (
              <Card>
                <CardContent className="p-3 sm:p-6">
                  <VideoStream
                    onStreamStart={handleVideoStart}
                    onComplete={handleComplete}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Help text */}
        <div className="text-center text-xs sm:text-sm text-gray-600 px-2 sm:px-0">
          Need assistance? Our support team is available 24/7 to help you with
          the verification process.
        </div>
      </div>
    </div>
  );
}
