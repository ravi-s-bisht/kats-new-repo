import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TutorialOverlayProps {
  onClose: () => void;
}

export default function TutorialOverlay({ onClose }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to Video Verification",
      description: "We'll guide you through a quick and secure video verification process.",
    },
    {
      title: "Position Yourself",
      description: "Make sure you're in a well-lit area and your face is visible to the camera.",
    },
    {
      title: "Face Detection",
      description: "A green box will appear when your face is properly positioned.",
    }
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      localStorage.setItem('hasSeenTutorial', 'true');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="p-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              {tutorialSteps[currentStep].title}
            </h2>
            <p className="text-gray-600">
              {tutorialSteps[currentStep].description}
            </p>
          </div>

          <div className="mt-8 flex justify-between items-center">
            <div className="flex gap-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-8 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <Button onClick={handleNext}>
              {currentStep === tutorialSteps.length - 1 ? "Get Started" : "Next"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}