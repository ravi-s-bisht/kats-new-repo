import { VitalChart } from "./vital-chart";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { subscribeToVitals } from "@/src/lib/vitals-processor";

export interface VitalsDisplayProps {
  isMonitoring: boolean;
}

export interface VitalReading {
  timestamp: number;
  value: number;
}

export interface BloodPressureReading {
  timestamp: number;
  systolic: number;
  diastolic: number;
}

export function VitalsDisplay({ isMonitoring }: VitalsDisplayProps) {
  const [heartRate, setHeartRate] = useState<VitalReading[]>([]);
  const [bloodPressure, setBloodPressure] = useState<BloodPressureReading[]>([]);
  const [bloodGlucose, setBloodGlucose] = useState<VitalReading[]>([]);
  const [signalQuality, setSignalQuality] = useState<number>(0);

  useEffect(() => {
    if (!isMonitoring) {
      // Clear readings when monitoring stops
      setHeartRate([]);
      setBloodPressure([]);
      setBloodGlucose([]);
      setSignalQuality(0);
      return;
    }

    const unsubscribe = subscribeToVitals((vitals) => {
      const { timestamp, heartRate: hr, bloodPressure: bp, bloodGlucose: bg, signalQuality: sq } = vitals;
      setSignalQuality(sq);

      if (hr !== null) {
        setHeartRate(prev => [...prev.slice(-30), { timestamp, value: hr }]);
      }

      if (bp.systolic !== null && bp.diastolic !== null) {
        setBloodPressure(prev => [...prev.slice(-30), { 
          timestamp,
          systolic: bp.systolic,
          diastolic: bp.diastolic
        }]);
      }

      if (bg !== null) {
        setBloodGlucose(prev => [...prev.slice(-30), { timestamp, value: bg }]);
      }
    });

    return () => unsubscribe();
  }, [isMonitoring]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`bg-primary/5 ${signalQuality < 0.3 ? 'opacity-50' : ''}`}>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-1">Heart Rate</h3>
            <div className="text-2xl font-bold">
              {heartRate.length && signalQuality >= 0.3 
                ? Math.round(heartRate[heartRate.length - 1].value)
                : "--"}
              <span className="text-sm font-normal ml-1">bpm</span>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-primary/5 ${signalQuality < 0.3 ? 'opacity-50' : ''}`}>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-1">Blood Pressure</h3>
            <div className="text-2xl font-bold">
              {bloodPressure.length && signalQuality >= 0.3
                ? `${Math.round(bloodPressure[bloodPressure.length - 1].systolic)}/${Math.round(bloodPressure[bloodPressure.length - 1].diastolic)}`
                : "--/--"}
              <span className="text-sm font-normal ml-1">mmHg</span>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-primary/5 ${signalQuality < 0.3 ? 'opacity-50' : ''}`}>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-1">Blood Glucose</h3>
            <div className="text-2xl font-bold">
              {bloodGlucose.length && signalQuality >= 0.3
                ? Math.round(bloodGlucose[bloodGlucose.length - 1].value)
                : "--"}
              <span className="text-sm font-normal ml-1">mg/dL</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {isMonitoring && signalQuality < 0.3 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-yellow-800">
            Signal quality too low. Please ensure:
            <ul className="list-disc ml-4 mt-2 text-sm">
              <li>Your face is well-lit</li>
              <li>You{"'"}re facing the camera directly</li>
              <li>You{"'"}re relatively still</li>
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <VitalChart
          data={heartRate}
          title="Heart Rate"
          unit="bpm"
          color="rgb(220, 38, 38)"
        />
        <VitalChart
          data={bloodPressure.map(bp => ({
            timestamp: bp.timestamp,
            value: bp.systolic
          }))}
          title="Systolic Pressure"
          unit="mmHg"
          color="rgb(37, 99, 235)"
        />
        <VitalChart
          data={bloodPressure.map(bp => ({
            timestamp: bp.timestamp,
            value: bp.diastolic
          }))}
          title="Diastolic Pressure"
          unit="mmHg"
          color="rgb(59, 130, 246)"
        />
        <VitalChart
          data={bloodGlucose}
          title="Blood Glucose"
          unit="mg/dL"
          color="rgb(34, 197, 94)"
        />
      </div>
    </div>
  );
}