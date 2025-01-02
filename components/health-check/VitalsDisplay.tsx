import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/src/lib/utils";
import { Heart, Activity, Scale, LineChart, Loader2 } from "lucide-react";

export interface VitalsData {
  bp: string;
  heartRate: number;
  hrv: number;
  bmi: number;
  depressionProbability: number;
}

interface VitalsDisplayProps {
  data?: VitalsData | null;
  isLoading?: boolean;
}

export default function VitalsDisplay({ data, isLoading = false }: VitalsDisplayProps) {
  // Helper function to determine BP status color
  const getBPStatusColor = (bp: string) => {
    if (!bp) return "text-gray-400";
    const [systolic, diastolic] = bp.split('/').map(Number);
    if (systolic < 120 && diastolic < 80) return "text-green-600";
    if (systolic < 130 && diastolic < 80) return "text-yellow-600";
    return "text-red-600";
  };

  // Helper function to determine heart rate status color
  const getHeartRateColor = (hr: number) => {
    if (!hr) return "text-gray-400";
    if (hr >= 60 && hr <= 100) return "text-green-600";
    return "text-red-600";
  };

  // Helper function to get depression probability color
  const getDepressionColor = (probability: number) => {
    if (!probability && probability !== 0) return "text-gray-400";
    if (probability < 30) return "text-green-600";
    if (probability < 70) return "text-yellow-600";
    return "text-red-600";
  };

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
    value: string | number | undefined; 
    unit: string;
    color: string;
    sublabel?: string;
  }) => (
    <div className="flex items-start gap-2 sm:gap-4 p-2 sm:p-4 bg-gray-50 rounded-lg">
      <div className={cn("p-1.5 sm:p-2 rounded-full", 
        color === "text-green-600" ? "bg-green-100" : 
        color === "text-yellow-600" ? "bg-yellow-100" : 
        color === "text-red-600" ? "bg-red-100" : "bg-gray-100"
      )}>
        <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs sm:text-sm font-medium text-gray-500">{label}</div>
        <div className={cn("text-lg sm:text-xl font-semibold mt-0.5 sm:mt-1 truncate", color)}>
          {value || "--"} {value ? unit : ""}
        </div>
        {sublabel && (
          <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">{sublabel}</div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-8 space-y-3 sm:space-y-4">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
        <p className="text-xs sm:text-sm text-gray-500">Analyzing vital signs and mental health indicators...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
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
              value={data?.bp}
              unit="mmHg"
              color={getBPStatusColor(data?.bp || "")}
              sublabel={
                !data?.bp ? undefined :
                Number(data.bp.split('/')[0]) < 120 ? "Normal" :
                Number(data.bp.split('/')[0]) < 130 ? "Elevated" : "High"
              }
            />

            <VitalSign
              icon={Heart}
              label="Heart Rate"
              value={data?.heartRate}
              unit="BPM"
              color={getHeartRateColor(data?.heartRate || 0)}
              sublabel={!data?.heartRate ? undefined :
                data.heartRate >= 60 && data.heartRate <= 100 ? "Normal" : "Abnormal"}
            />

            <VitalSign
              icon={LineChart}
              label="Heart Rate Variability"
              value={data?.hrv}
              unit="ms"
              color={data?.hrv ? "text-blue-600" : "text-gray-400"}
            />

            <VitalSign
              icon={Scale}
              label="Body Mass Index"
              value={data?.bmi ? data.bmi.toFixed(1) : "--"}
              unit=""
              color={data?.bmi ? "text-indigo-600" : "text-gray-400"}
              sublabel={!data?.bmi ? undefined :
                data.bmi < 18.5 ? "Underweight" :
                data.bmi < 25 ? "Normal" :
                data.bmi < 30 ? "Overweight" : "Obese"
              }
            />
          </CardContent>
        </Card>

        {/* Mental Health Section */}
        <Card className="overflow-hidden">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
              Mental Health Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <dt className="text-xs sm:text-sm font-medium text-gray-500">Depression Probability</dt>
                <dd className={cn(
                  "text-2xl sm:text-3xl font-semibold mt-2 sm:mt-3",
                  getDepressionColor(data?.depressionProbability || -1)
                )}>
                  {data?.depressionProbability !== undefined ? `${data.depressionProbability}%` : "--"}
                </dd>
                <div className="mt-3 sm:mt-4 bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500 ease-in-out",
                      getDepressionColor(data?.depressionProbability || -1)
                    )}
                    style={{ width: `${data?.depressionProbability ?? 0}%` }}
                  />
                </div>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-600">
                  {data?.depressionProbability === undefined ? "No data available" :
                    data.depressionProbability < 30
                      ? "Low risk of depression"
                      : data.depressionProbability < 70
                      ? "Moderate risk of depression"
                      : "High risk of depression"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-xs text-gray-500">
        Note: These measurements are derived from video analysis and should be verified by a healthcare professional.
      </div>
    </div>
  );
}