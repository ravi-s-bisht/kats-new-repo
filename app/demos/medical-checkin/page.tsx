"use client";

import { useToast } from "@/hooks/use-toast";
import { useShenaiSdk } from "@/hooks/useShenaiSdk";
import { InitializationSettings } from "shenai-sdk";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import styles from "@/styles/Home.module.css";
import AuthPrompt from "@/components/health-check/AuthPrompt";
import { useUser } from "@/src/contexts/UserContext";
import { useAnalysis } from "@/src/lib/context";
import { AverageFinalReport } from "@/components/health-check/VideoCheckIn";
import VitalsDisplay from "@/components/health-check/VitalsDisplay";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

const VideoStream = dynamic(() => import('@/components/health-check/VideoStream'), {
  ssr: false,
});
import { subscribeToVitals } from "@/src/lib/vitals-processor";
import { VitalReading } from "@/components/vitals-display";

export interface ReplitVitals {
  heartRate?: number | null;
  bloodPressure?: string | null;
  hrv?: number | null;
  bloodGlucose?: number | null;
}

function Page() {
  // TODO: Remove api key
  const apiKey = "62ad70ae10a84a028e615b781dd81a73";
  const shenaiSDK = useShenaiSdk();
  const [pendingInitialization, setPendingInitialization] = useState(false);
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(2);
  const { user } = useUser();
  const {
    analysisData,
    isLoggedIn,
    setIsLoggedIn,
    setAnalysisData,
    replitBloodGlucose,
    setReplitBloodGlucose,
  } = useAnalysis();
  const [showVideoCheck, setShowVideoCheck] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const [replitVitals, setReplitVitals] = useState<ReplitVitals>({
    heartRate: null,
    bloodPressure: null,
    hrv: null,
    bloodGlucose: null,
  });
  const startMonitoringRef = useRef<boolean>(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [bloodGlucose, setBloodGlucose] = useState<number[]>([]);
  const bloodGlucoseRef = useRef<number[]>([]);
  const cameraCloneStreamRef = useRef<MediaStream | null>(null);

  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  const canvasTopRef = useRef<HTMLDivElement>(null);
  const scrollToCanvas = () => {
    console.log("would scroll but no element");
    if (canvasTopRef.current) {
      console.log("should scroll to canvas now");
      canvasTopRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  const initializeSdk = (
    apiKey: string,
    settings: InitializationSettings,
    onSuccess?: () => void
  ) => {
    if (!shenaiSDK) return;

    shenaiSDK.initialize(apiKey, "", settings, (res) => {
      if (res === shenaiSDK.InitializationResult.OK) {
        console.log("Shen.AI License result: ", res);
        shenaiSDK.attachToCanvas("#mxcanvas");
        onSuccess?.();
        scrollToCanvas();
      } else {
        toast({
          title: "License initialization problem",
          description: "Shenai license initialization problem.",
        });
      }
      setPendingInitialization(false);
    });
  };

  useEffect(() => {
    if (!shenaiSDK || currentStep == 3) return;

    // Check if it is a mobile browser
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    const cameraModeCustom = isMobile
      ? shenaiSDK.CameraMode.FACING_USER
      : shenaiSDK.CameraMode.DEVICE_ID;

    const settings: InitializationSettings = {
      precisionMode: shenaiSDK.PrecisionMode.STRICT,
      operatingMode: shenaiSDK.OperatingMode.POSITIONING,
      measurementPreset: shenaiSDK.MeasurementPreset.ONE_MINUTE_BETA_METRICS,
      cameraMode: cameraModeCustom,
      onboardingMode: shenaiSDK.OnboardingMode.HIDDEN,
      showUserInterface: true,
      showFacePositioningOverlay: true,
      showVisualWarnings: true,
      enableCameraSwap: true,
      showFaceMask: true,
      showBloodFlow: true,
      hideShenaiLogo: true,
      enableStartAfterSuccess: true,
      enableSummaryScreen: true,
      enableHealthRisks: true,
      showOutOfRangeResultIndicators: true,
      showTrialMetricLabels: false,
      enableFullFrameProcessing: false,
    };

    if (apiKey && apiKey.length > 0) {
      console.log("INITIALIZINGGGG!");
      initializeSdk(apiKey, settings, () =>
        console.log("Initialization successfull!!!!")
      );
    }

    return () => {
      shenaiSDK.deinitialize();
    };
  }, [shenaiSDK]);

  useEffect(() => {
    if (shenaiSDK) {
      let interval: any;

      // Poll the measurement state periodically
      const pollMeasurementState = async () => {
        const state = shenaiSDK?.getMeasurementState();
        // console.log(`Current state: `, state);
        if (shenaiSDK.getOperatingMode() == shenaiSDK.OperatingMode.MEASURE) {
          const unsubscribe = subscribeToVitals((vitals) => {
            const {
              timestamp,
              heartRate: hr,
              bloodPressure: bp,
              bloodGlucose: bg,
              hrv: hrvValue,
              signalQuality: sq,
            } = vitals;

            if (bg !== null) {
              // console.log("New Blood Glucose Reading:", bg); // Debug log

              // Update bloodGlucose state using the functional form of setState
              setBloodGlucose((prev) => {
                const newGlucose = [...prev.slice(-29), bg]; // Keep the last 30 readings
                // console.log("Updated Blood Glucose Array:", newGlucose); // Debug log
                return newGlucose;
              });
            }
          });
        }

        if (
          shenaiSDK.getOperatingMode() == shenaiSDK.OperatingMode.MEASURE &&
          !startMonitoringRef.current
        ) {
          startMonitoringRef.current = true;
          setIsMonitoring(true);
          console.log("started");
        }

        if (state === shenaiSDK.MeasurementState.FINISHED) {
          clearInterval(interval);
          // Redirect to final report page
          const measurement = shenaiSDK?.getMeasurementResults();
          console.log("FINAL MEASUREMENT: ", replitVitals);

          console.log("Measurement results: ", measurement);
          console.log(
            "Blood glucose final: ",
            Math.round(
              bloodGlucoseRef.current[bloodGlucoseRef.current.length - 1] ?? 0
            ) ?? null
          );
          handleVideoComplete({
            averageHeartRate: measurement?.heart_rate_bpm ?? 0,
            averageBloodPressure: `${
              measurement?.systolic_blood_pressure_mmhg ?? 0
            }/${measurement?.diastolic_blood_pressure_mmhg ?? 0}`,
            averageHRV: measurement?.hrv_lnrmssd_ms ?? 0,
            averageBloodGlucose: Math.round(
              bloodGlucoseRef.current[bloodGlucoseRef.current.length - 1] ?? 0
            ),
            confidence: 0,
            totalReadings: 1,
          });
        }
      };

      // Start polling
      interval = setInterval(pollMeasurementState, 1000);

      // Cleanup on component unmount
      return () => clearInterval(interval);
    }
  }, [shenaiSDK]);

  useEffect(() => {
    bloodGlucoseRef.current = bloodGlucose;
  }, [bloodGlucose]);

  const handleStreamComplete = (finalReport: AverageFinalReport) => {
    // setAnalysisData({
    //   heartRate: finalReport.averageHeartRate,
    //   bp: finalReport.averageBloodPressure,
    //   hrv: finalReport.averageHRV,
    //   bloodGlucose: finalReport.averageBloodGlucose,
    //   depressionProbability: finalReport.confidence,
    // });
    // handleVideoComplete?.();
  };

  const handleReset = () => {
    setCurrentStep(2);
    setShowVideoCheck(false);
    setIsAnalyzing(false);
    setIsMonitoring(false);

    window.location.reload();
  };

  const startVideoCheck = () => {
    setCurrentStep(2);
    setShowVideoCheck(true);
  };

  const handleVideoComplete = (finalReport: AverageFinalReport) => {
    setAnalysisData({
      heartRate: finalReport.averageHeartRate,
      bp: finalReport.averageBloodPressure,
      hrv: finalReport.averageHRV,
      bloodGlucose: finalReport.averageBloodGlucose,
      depressionProbability: finalReport.confidence,
    });
    setShowVideoCheck(false);
    setIsAnalyzing(true);
    setCurrentStep(3);
    if (shenaiSDK) {
      console.log("Deinitializing Shenai SDK");
      shenaiSDK.deinitialize();
    }

    stopCameraCloneStream();

    setTimeout(() => {
      setIsAnalyzing(false);
      // if (!user) {
      //   console.warn("User is not logged in, prompting for auth", user);
      //   setShowAuthPrompt(true);
      // }
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
    setIsMobile(isMobileDevice());
    const storedData = localStorage.getItem("analysisData");
    // if (user) {
    //   try {
    //     // const parsedData: VitalsData = JSON.parse(storedData);
    //     // setAnalysisData(parsedData);
    //     // localStorage.removeItem("analysisData"); // Clean up after loading
    //     handleAuthSuccess();
    //   } catch (error) {
    //     console.error("Error parsing stored analysis data:", error);
    //   }
    // }

    // if (!user) {
    //   setIsLoggedIn(false);
    // }
  }, []);

  // Hijack Shen.ai's video stream by copying the canvas
  useEffect(() => {
    // Request access to the camera
    const getCameraFeed = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        cameraCloneStreamRef.current = stream;

        console.log("Got camera stream:", stream);
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    getCameraFeed();

    // Clean up the camera stream when the component unmounts
    return () => {
      const stream = cameraCloneStreamRef.current;
      stopMediaStream(stream);
    };
  }, []);

  const stopMediaStream = (stream: MediaStream | null) => {
    if (stream) {
      console.log("Stopping media stream");
      stream.getTracks().forEach((track) => {
        console.log("Stopping track:", track);
        track.stop();
      });
    }
  };

  const stopCameraCloneStream = () => {
    const stream = cameraCloneStreamRef.current;
    if (stream) {
      console.log("Stopping camera clone stream");
      stopMediaStream(stream);
      cameraCloneStreamRef.current = null;
    } else {
      console.log("No camera clone stream to stop");
    }
  };

  const handleStreamStart = (stream: MediaStream | null) => {
    // setIsStreamActive(!!stream);
    console.log("Stream started");
  };

  const handleVitalsUpdate = (vitals: {
    heartRate: number;
    bloodPressure: string;
    hrv: number;
    bloodGlucose: number;
  }) => {
    return;
  };

  return (
    <>
      {showAuthPrompt && <AuthPrompt onAuthSuccess={handleAuthSuccess} />}

      {currentStep != 3 && (
        <div
          className={`${!isMobile ? "flex" : ""} justify-center items-center`}
        >
          <div ref={canvasTopRef} className={styles.mxcanvasTopHelper} />
          <canvas
            id="mxcanvas"
            className={`${styles.mxcanvas} ${isMobile ? "w-full" : ""}`}
          />
          <VideoStream
            onStreamStart={handleStreamStart}
            onComplete={handleStreamComplete}
            onVitalsUpdate={handleVitalsUpdate}
            onCancel={handleVideoCancel}
            handleReset={handleReset}
            videoCloneStream={cameraCloneStreamRef.current}
            setReplitVitals={setReplitVitals}
            isMonitoring={isMonitoring}
            setIsMonitoring={setIsMonitoring}
          />
        </div>
      )}

      {currentStep === 3 && !isAnalyzing && analysisData && !showAuthPrompt && (
        <div className="space-y-6 mt-8">
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

          <VitalsDisplay data={analysisData} handleReset={handleReset} />
          {/* {user ? (
            <VitalsDisplay data={analysisData} handleReset={handleReset} />
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                Sign in to view your complete health analysis
              </p>
            </div>
          )} */}
        </div>
      )}
    </>
  );
}

export default Page;
