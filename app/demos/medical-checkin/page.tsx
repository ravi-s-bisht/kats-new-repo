'use client';

export const runtime = "edge";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Video, Camera, Check, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepProgress from "@/components/health-check/StepProgress";
import VitalsDisplay, { VitalsData } from "@/components/health-check/VitalsDisplay";
import VideoCheckIn from "@/components/health-check/VideoCheckIn";
import { useAnalysis } from "@/src/lib/context";
import AuthPrompt from "@/components/health-check/AuthPrompt";
import { useUser } from "@/src/contexts/UserContext";

const steps = [
  { id: 1, title: "Start Video", icon: Video, description: "Begin secure video verification" },
  { id: 2, title: "Video Check", icon: Camera, description: "Position yourself for vital signs analysis" },
  { id: 3, title: "Complete", icon: Check, description: "Review your health analysis" }
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useUser();
  const { analysisData, isLoggedIn, setIsLoggedIn, setAnalysisData } = useAnalysis();
  const [showVideoCheck, setShowVideoCheck] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

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
    const storedData = localStorage.getItem('analysisData');
    if (user && storedData) {
      try {
        const parsedData: VitalsData = JSON.parse(storedData);
        setAnalysisData(parsedData);
        localStorage.removeItem('analysisData'); // Clean up after loading
        handleAuthSuccess();
      } catch (error) {
        console.error("Error parsing stored analysis data:", error);
      }
    }

    if (!user) {
      setIsLoggedIn(false);
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        <header className="text-center px-2 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            Medical Video Verification
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Complete your secure video verification for a comprehensive health analysis. This non-invasive process uses advanced computer vision to analyze your vital signs in just 30 seconds.
          </p>
        </header>

        <Card className="border-none shadow-lg">
          <CardHeader className="px-4 sm:px-6">
            <StepProgress steps={steps} currentStep={currentStep} />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 bg-white rounded-lg">
            <div className="space-y-4 sm:space-y-6">
              {currentStep === 1 && (
                <div className="text-center">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    Start Your Health Assessment
                  </h2>
                  <div className="prose prose-sm max-w-2xl mx-auto mb-6 text-gray-600">
                    <p className="mb-4">
                      Before you begin, ensure you are:
                    </p>
                    <ul className="list-disc text-left pl-4 space-y-2">
                      <li>In a well-lit room with natural or bright lighting</li>
                      <li>Facing the camera directly with your full face visible</li>
                      <li>In a quiet environment to ensure accurate measurements</li>
                      <li>Ready to remain still for 30 seconds during the check</li>
                    </ul>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={startVideoCheck}
                    className="gap-2 px-8"
                  >
                    <Video className="h-5 w-5" />
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
                      Here{"\'"}s your comprehensive health analysis. Our AI-powered system has analyzed your vital signs and health indicators.
                    </p>
                  </div>

                  {isLoggedIn ? (
                    <VitalsDisplay data={analysisData} />
                  ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">
                        Sign in to view your complete health analysis
                      </p>
                    </div>
                  )}

                  <div className="flex justify-center gap-4">
                    <Button 
                      variant="outline" 
                      onClick={handleReset}
                      className="gap-2"
                    >
                      <Video className="h-4 w-4" />
                      New Analysis
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <footer className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600">
            <Info className="h-4 w-4" />
            <p>
              This analysis is for informational purposes only and should not be considered medical advice.
            </p>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Need assistance? Our support team is available 24/7 to help you with the verification process.
          </p>
        </footer>
      </div>

      {showVideoCheck && (
        <VideoCheckIn onComplete={handleVideoComplete} onCancel={handleVideoCancel} />
      )}

      {showAuthPrompt && (
        <AuthPrompt onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}