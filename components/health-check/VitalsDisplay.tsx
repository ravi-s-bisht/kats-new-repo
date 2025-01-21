'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/src/lib/utils";
import { Heart, Activity, LineChart, Droplet, Loader2, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";

export interface VitalsData {
  bp: string | null;
  heartRate: number | null;
  hrv: string | number | null;
  bloodGlucose: string | number | null;
  depressionProbability: string | number;
}

interface VitalsDisplayProps {
  data?: VitalsData | null;
  handleReset: () => void;
  isLoading?: boolean;
}

const VitalSign = ({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  color, 
  sublabel 
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  unit: string;
  color: string;
  sublabel?: string;
}) => (
  <motion.div 
    className="flex items-start gap-2 sm:gap-4 p-2 sm:p-4 bg-gray-50 rounded-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className={cn("p-1.5 sm:p-2 rounded-full", 
      color === "text-green-600" ? "bg-green-100" : 
      color === "text-yellow-600" ? "bg-yellow-100" : 
      color === "text-red-600" ? "bg-red-100" : "bg-gray-100"
    )}>
      <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", color)} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs sm:text-sm font-medium text-gray-500">{label}</div>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${value}-${unit}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className={cn("text-lg sm:text-xl font-semibold mt-0.5 sm:mt-1 truncate", color)}
        >
          {value || "--"} {value && value !== "--" ? unit : ""}
        </motion.div>
      </AnimatePresence>
      {sublabel && (
        <motion.div 
          className="text-xs text-gray-500 mt-0.5 sm:mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {sublabel}
        </motion.div>
      )}
    </div>
  </motion.div>
);

export default function VitalsDisplay({ data, isLoading = false, handleReset }: VitalsDisplayProps) {
  // Helper function to determine BP status color
  const getBPStatusColor = (bp: string) => {
    if (!bp || bp === "--") return "text-gray-400";
    const [systolic, diastolic] = bp.split('/').map(Number);
    if (systolic < 120 && diastolic < 80) return "text-green-600";
    if (systolic < 130 && diastolic < 80) return "text-yellow-600";
    return "text-gray-200";
  };

  // Helper function to determine heart rate status color
  const getHeartRateColor = (hr: number) => {
    if (!hr) return "text-gray-400";
    if (hr >= 60 && hr <= 100) return "text-green-600";
    return "text-red-600";
  };

  // Helper function to get blood glucose color
  const getBloodGlucoseColor = (glucose: number | string) => {
    if (glucose === "--" || (!glucose && glucose !== 0)) return "text-gray-400";
    if (typeof glucose === "string") return "text-gray-400";
    if (glucose < 70) return "text-red-600"; // Low
    if (glucose <= 140) return "text-green-600"; // Normal
    if (glucose <= 200) return "text-yellow-600"; // High
    return "text-red-600"; // Very High
  };

  // Helper function to get depression probability color
  const getDepressionColor = (probability: number | string) => {
    if (probability === "--" || (!probability && probability !== 0)) return "text-gray-400";
    if (typeof probability === "string") return "text-gray-400";
    if (probability < 30) return "text-green-600";
    if (probability < 70) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 sm:p-8 space-y-3 sm:space-y-4">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
        <p className="text-xs sm:text-sm text-gray-500">Analyzing vital signs and mental health indicators...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-3 sm:space-y-6 p-5 sm:mt-6 mt-5 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-1 gap-1 sm:gap-6 text-center justify-center items-center">
        {/* Physical Vitals Section */}
        <Card className="overflow-hidden">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
              Physical Vitals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 grid gap-2 sm:gap-4">
            <VitalSign
              icon={Activity}
              label="Blood Pressure"
              value={data?.bp || "--"}
              unit="mmHg"
              color={getBPStatusColor(data?.bp || "")}
              sublabel={
                !data?.bp || data.bp === "--" ? undefined :
                Number(data.bp.split('/')[0]) < 120 ? "Normal" :
                Number(data.bp.split('/')[0]) < 130 ? "Elevated" : "High"
              }
            />

            <VitalSign
              icon={Heart}
              label="Heart Rate"
              value={data?.heartRate || "--"}
              unit="BPM"
              color={getHeartRateColor(data?.heartRate || 0)}
              sublabel={!data?.heartRate ? undefined :
                data.heartRate >= 60 && data.heartRate <= 100 ? "Normal" : "Abnormal"}
            />
            {/* <VitalSign
              icon={Droplet}
              label="Blood Glucose"
              value={data?.bloodGlucose || "--"}
              unit="mg/dL"
              color={getBloodGlucoseColor(data?.bloodGlucose || "--")}
              sublabel={!data?.bloodGlucose || data.bloodGlucose === "--" ? undefined :
                Number(data.bloodGlucose) < 70 ? "Low" :
                Number(data.bloodGlucose) <= 140 ? "Normal" :
                Number(data.bloodGlucose) <= 200 ? "High" : "Very High"
              }
            /> */}
            <VitalSign
              icon={LineChart}
              label="Heart Rate Variability"
              value={data?.hrv || "--"}
              unit="ms"
              color={data?.hrv === "--" ? "text-gray-400" : "text-blue-600"}
            />
          </CardContent>
        </Card>

        {/* Mental Health Section */}
        {/* <Card className="overflow-hidden">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
              Mental Health Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <dt className="text-xs sm:text-sm font-medium text-gray-500">Depression Probability</dt>
                <AnimatePresence mode="wait">
                  <motion.dd
                    key={data?.depressionProbability}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "text-2xl sm:text-3xl font-semibold mt-2 sm:mt-3",
                      // getDepressionColor(data?.depressionProbability || "--")
                    )}
                  >
                    {data?.depressionProbability !== undefined && data?.depressionProbability !== "--" ? `Coming Soon` : "Coming Soon"}
                  </motion.dd>
                </AnimatePresence>
                <div className="mt-3 sm:mt-4 bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500 ease-in-out",
                      getDepressionColor(data?.depressionProbability || "--")
                    )}
                    style={{ width: typeof data?.depressionProbability === 'number' ? `${data.depressionProbability}%` : '0%' }}
                  />
                </div>
                <motion.p 
                  className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {data?.depressionProbability === undefined || data?.depressionProbability === "--" ? "No data available" :
                    Number(data.depressionProbability) < 30
                      ? "Low risk of depression"
                      : Number(data.depressionProbability) < 70
                      ? "Moderate risk of depression"
                      : "High risk of depression"}
                </motion.p>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
      <div className="text-center text-xs text-gray-500">
        Note: These measurements are derived from video analysis and should be verified by a healthcare professional.
      </div>

      <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => handleReset()} className="gap-2">
              <Video className="h-4 w-4" />
              New Analysis
            </Button>
          </div>
    </motion.div>
  );
}