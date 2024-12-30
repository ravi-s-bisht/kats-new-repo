import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

interface Step {
  id: number;
  title: string;
  icon: LucideIcon;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
}

export default function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="relative">
      <div className="absolute top-5 left-6 right-6 h-0.5 bg-gray-200">
        <motion.div
          className="absolute h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      <div className="relative flex justify-between">
        {steps.map((step) => {
          const Icon = step.icon;
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <motion.div
              key={step.id}
              className="flex flex-col items-center relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: step.id * 0.2 }}
            >
              <motion.div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200",
                  isComplete || isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-200 text-gray-400"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="h-5 w-5" />
              </motion.div>
              <motion.span
                className={cn(
                  "mt-2 text-sm font-medium",
                  isComplete || isCurrent ? "text-primary" : "text-gray-500"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: step.id * 0.3 }}
              >
                {step.title}
              </motion.span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}