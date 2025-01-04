import { useState } from "react";
import { X, ArrowRight, Video, Heart, User, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TutorialOverlayProps {
  onClose: () => void;
}

export default function TutorialOverlay({ onClose }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to Health Check",
      description: "We'll guide you through a quick and secure video verification process to analyze your vital signs.",
      icon: Video,
      tips: [
        "The process takes only 30 seconds",
        "Your privacy is our priority",
        "No special equipment needed"
      ]
    },
    {
      title: "Optimal Positioning",
      description: "For accurate results, make sure you're in a well-lit environment with your face clearly visible.",
      icon: User,
      tips: [
        "Find a bright, quiet space",
        "Face the camera directly",
        "Keep your head within the guide frame"
      ]
    },
    {
      title: "During Analysis",
      description: "Our AI will analyze your vital signs through subtle changes in your facial features.",
      icon: Heart,
      tips: [
        "Stay still during the process",
        "Breathe normally",
        "Keep looking at the camera"
      ]
    },
    {
      title: "Important Notes",
      description: "This analysis provides general health insights but is not a substitute for medical examination.",
      icon: AlertCircle,
      tips: [
        "Results are for reference only",
        "Consult healthcare professionals",
        "Regular check-ups are important"
      ]
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

  const CurrentIcon = tutorialSteps[currentStep].icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CurrentIcon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {tutorialSteps[currentStep].title}
              </h2>
            </div>

            <p className="text-gray-600">
              {tutorialSteps[currentStep].description}
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-gray-700">Helpful Tips</span>
              </div>
              <ul className="space-y-2">
                {tutorialSteps[currentStep].tips.map((tip, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
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
            <Button onClick={handleNext} className="gap-2">
              {currentStep === tutorialSteps.length - 1 ? "Get Started" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}