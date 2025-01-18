"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  AlertCircle,
  Loader2,
  X,
  Info,
  Square,
  Play,
} from "lucide-react";
import {
  detectFace,
  isFaceWellPositioned,
  loadFaceDetectionModels,
} from "@/src/lib/faceDetection";
import { HeartRateDetector } from "@/src/lib/heartRateDetection";
import { BloodPressureEstimator } from "@/src/lib/bloodPressureEstimation";
import { VitalMeasurements } from "@/src/lib/vitalMeasurements";
import { motion } from "framer-motion";
import { AverageFinalReport } from "./VideoCheckIn";
import { CustomProgress } from "../ui/CustomProgress";
import * as faceapi from "@vladmandic/face-api";
import { WebcamFeed } from "../webcam-feed";
import { BloodPressureReading, VitalReading, VitalsDisplay } from "../vitals-display";
import { subscribeToVitals } from "@/src/lib/vitals-processor";

interface VideoStreamProps {
  onStreamStart: (stream: MediaStream | null) => void;
  onComplete?: (finalReport: AverageFinalReport) => void;
  onVitalsUpdate?: (vitals: {
    heartRate: number;
    bloodPressure: string;
    hrv: number;
    bloodGlucose: number;
    heartRateHistory: number[];
  }) => void;
  onCancel?: () => void;
  handleReset: () => void;
}

export default function VideoStream({
  onStreamStart,
  onComplete,
  onVitalsUpdate,
  onCancel,
  handleReset,
}: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const debugCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const heartRateDetectorRef = useRef<HeartRateDetector>();
  const bloodPressureEstimatorRef = useRef<BloodPressureEstimator>();
  const frameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);
  const [fps, setFps] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isFaceAligned, setIsFaceAligned] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [showVideoCheck, setShowVideoCheck] = useState(false);
  const lastBPUpdateRef = useRef<number>(0);
  const [realTimeHeartRate, setRealTimeHeartRate] = useState<number | null>(
    null
  );
  const detectedFaceOverlayRef = useRef<HTMLCanvasElement>(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const vitalMeasurementsRef = useRef<VitalMeasurements>(
    new VitalMeasurements()
  );
  let faceDetection: any;

  const [conditions, setConditions] = useState({
    isStable: true,
    hasFace: false,
    hasGoodLighting: true,
    isWellPositioned: false,
  });

  const [lastFrameData, setLastFrameData] = useState<ImageData | null>(null);

  const checkDeviceStability = (
    currentFrame: ImageData,
    previousFrame: ImageData | null
  ): boolean => {
    if (!previousFrame) return true;

    const threshold = 30; // Adjust sensitivity
    const pixelDiffThreshold = 0.1; // Percentage of pixels that can be different
    let differentPixels = 0;

    for (let i = 0; i < currentFrame.data.length; i += 4) {
      const diff =
        Math.abs(currentFrame.data[i] - previousFrame.data[i]) +
        Math.abs(currentFrame.data[i + 1] - previousFrame.data[i + 1]) +
        Math.abs(currentFrame.data[i + 2] - previousFrame.data[i + 2]);

      if (diff > threshold) {
        differentPixels++;
      }
    }

    const percentageDifferent =
      differentPixels / (currentFrame.data.length / 4);
    return percentageDifferent < pixelDiffThreshold;
  };

  const checkLightingQuality = (frame: ImageData): boolean => {
    let totalBrightness = 0;
    for (let i = 0; i < frame.data.length; i += 4) {
      const r = frame.data[i];
      const g = frame.data[i + 1];
      const b = frame.data[i + 2];
      totalBrightness += (r + g + b) / 3;
    }

    const averageBrightness = totalBrightness / (frame.data.length / 4) / 255;
    return averageBrightness > 0.5 && averageBrightness < 0.8; // Acceptable brightness range
  };

  const drawDebugInfo = (
    ctx: CanvasRenderingContext2D,
    face: any,
    videoWidth: number,
    videoHeight: number,
    brightness: number
  ) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (face && face.landmarks && face.landmarks.positions) {
      ctx.font = "12px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.textBaseline = "top";

      const debugInfo = [
        `FPS: ${fps.toFixed(1)}`,
        `Face Detected: Yes`,
        `Brightness: ${(brightness * 100).toFixed(1)}%`,
        `Frame Time: ${frameTimeRef.current.toFixed(1)}ms`,
      ];

      debugInfo.forEach((text, i) => {
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(10, 10 + i * 20, ctx.measureText(text).width + 10, 20);
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillText(text, 15, 12 + i * 20);
      });
    }
  };

  const calculateBrightness = (videoElement: HTMLVideoElement): number => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return 0;

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let brightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }

    return brightness / (data.length / 4) / 255;
  };

  function drawFaceMapping(
    video: HTMLVideoElement,
    detection: faceapi.WithFaceLandmarks<{
      detection: faceapi.FaceDetection;
    }>,
    detectedFaceOverlayRef: React.RefObject<HTMLCanvasElement>
  ): void {
    const canvas = detectedFaceOverlayRef.current;
    if (!canvas || !video || !detection) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas dimensions to match the video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear previous drawings
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the detected face box
    const box = detection.detection.box;
    context.strokeStyle = "red";
    context.lineWidth = 2;
    context.strokeRect(box.x, box.y, box.width, box.height);

    // Draw landmarks
    context.fillStyle = "blue";
    detection.landmarks.positions.forEach((point) => {
      context.beginPath();
      context.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      context.fill();
    });

    // Calculate guidance box using the same logic as `isWellPositioned`
    const devicePixelRatio = window.devicePixelRatio || 1;
    const videoWidth = video.videoWidth * devicePixelRatio;
    const videoHeight = video.videoHeight * devicePixelRatio;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const padding = videoWidth * 0.05;

    const guidanceBox = isMobile
      ? {
          left: videoWidth * 0.15 - padding,
          right: videoWidth * 0.85 + padding,
          top: videoHeight * 0.15 - padding,
          bottom: videoHeight * 0.85 + padding,
        }
      : {
          left: videoWidth * 0.15,
          right: videoWidth * 0.85,
          top: videoHeight * 0.15,
          bottom: videoHeight * 0.88,
        };

    // Draw the guidance box
    context.strokeStyle = "green";
    context.lineWidth = 2;
    context.strokeRect(
      guidanceBox.left / devicePixelRatio,
      guidanceBox.top / devicePixelRatio,
      (guidanceBox.right - guidanceBox.left) / devicePixelRatio,
      (guidanceBox.bottom - guidanceBox.top) / devicePixelRatio
    );
  }

  const processFrame = async () => {
    if (
      !videoRef.current ||
      !heartRateDetectorRef.current ||
      !bloodPressureEstimatorRef.current ||
      !overlayCanvasRef.current
    ) {
      console.log("Missing required refs for vital detection");
      return;
    }

    const now = performance.now();
    frameCountRef.current++;
    if (now - lastFpsUpdateRef.current >= 1000) {
      setFps((frameCountRef.current * 1000) / (now - lastFpsUpdateRef.current));
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = now;
    }

    if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
      console.log("Video dimensions not available yet");
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    // Create canvas for frame analysis
    const analysisCanvas = document.createElement("canvas");
    analysisCanvas.width = videoRef.current.videoWidth;
    analysisCanvas.height = videoRef.current.videoHeight;
    const analysisCtx = analysisCanvas.getContext("2d");

    if (!analysisCtx) {
      console.error("Could not get analysis canvas context");
      return;
    }

    // Draw current frame to analysis canvas
    analysisCtx.drawImage(videoRef.current, 0, 0);
    const currentFrameData = analysisCtx.getImageData(
      0,
      0,
      analysisCanvas.width,
      analysisCanvas.height
    );

    // Check conditions
    const isStable = checkDeviceStability(currentFrameData, lastFrameData);
    const hasGoodLighting = checkLightingQuality(currentFrameData);

    try {
      const faceDetection = await detectFace(
        videoRef.current,
        detectedFaceOverlayRef,
        drawFaceMapping
      );
      const hasFace = !!faceDetection;

      let isWellPositioned = false;
      if (faceDetection?.detection) {
        const devicePixelRatio = window.devicePixelRatio || 1;
        const videoWidth = videoRef.current.videoWidth * devicePixelRatio;
        const videoHeight = videoRef.current.videoHeight * devicePixelRatio;

        const faceBox = {
          x:
            (faceDetection.detection.box.x / videoRef.current.videoWidth) *
            videoWidth,
          y:
            (faceDetection.detection.box.y / videoRef.current.videoHeight) *
            videoHeight,
          width:
            (faceDetection.detection.box.width / videoRef.current.videoWidth) *
            videoWidth,
          height:
            (faceDetection.detection.box.height /
              videoRef.current.videoHeight) *
            videoHeight,
        };

        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        const padding = videoWidth * 0.05;

        const boxRegion = isMobile
          ? {
              left: videoWidth * 0.15 - padding,
              right: videoWidth * 0.85 + padding,
              top: videoHeight * 0.15 - padding,
              bottom: videoHeight * 0.85 + padding,
            }
          : {
              left: videoWidth * 0.15,
              right: videoWidth * 0.85,
              top: videoHeight * 0.15,
              bottom: videoHeight * 0.88,
            };

        isWellPositioned =
          faceBox.x > boxRegion.left &&
          faceBox.x + faceBox.width < boxRegion.right &&
          faceBox.y > boxRegion.top &&
          faceBox.y + faceBox.height < boxRegion.bottom;

        console.log("Face Box:", faceBox);
        console.log("Guidance Box Region:", boxRegion);
      }

      // Update conditions state
      setConditions({
        isStable,
        hasFace,
        hasGoodLighting,
        isWellPositioned,
      });

      // Handle progress tracking
      const allConditionsMet = hasFace && isWellPositioned && hasGoodLighting;

      if (timerRef.current) {
        const duration = 30000; // 60 seconds
        const currentTime = Date.now();

        // Initialize start time if not set
        if (!startTimeRef.current) {
          startTimeRef.current = currentTime;
          lastElapsedTimeRef.current = 0;
          console.log("[Progress] Starting timer");
        }

        try {
          // Only accumulate time when all conditions are met
          if (allConditionsMet) {
            const timeIncrement = currentTime - startTimeRef.current;
            const newElapsed = lastElapsedTimeRef.current + timeIncrement;
            const newProgress = Math.min(100, (newElapsed / duration) * 100);

            console.log("[Progress] Conditions met, adding time:", {
              increment: timeIncrement,
              total: newElapsed,
              progress: newProgress.toFixed(1) + "%",
            });

            setProgress(newProgress);

            if (newProgress >= 100) {
              if (timerRef.current) {
                clearInterval(timerRef.current);
              }
              stopVideo();
              const finalReport = vitalMeasurementsRef.current.getFinalReport();
              console.log("Final vital signs report:", finalReport);
              onComplete?.(finalReport);
            }

            // Update accumulated time
            lastElapsedTimeRef.current = newElapsed;
          } else {
            console.log(
              "[Progress] Paused at",
              ((lastElapsedTimeRef.current / duration) * 100).toFixed(1) + "%",
              "- Waiting for:",
              {
                // stability: !isStable,
                face: !hasFace,
                lighting: !hasGoodLighting,
                position: !isWellPositioned,
              }
            );
          }
        } catch (error) {
          console.error("[Progress] Error updating progress:", error);
        }

        // Always update the reference time for next calculation
        startTimeRef.current = currentTime;
      }

      const brightness = calculateBrightness(videoRef.current);
      console.log(
        "[Frame] Scene brightness:",
        (brightness * 100).toFixed(1) + "%"
      );

      // const debugCtx = debugCanvasRef?.current.getContext("2d");
      // if (debugCtx) {
      //   drawDebugInfo(
      //     debugCtx,
      //     faceDetection,
      //     videoRef.current.videoWidth,
      //     videoRef.current.videoHeight,
      //     brightness
      //   );
      // }

      const overlayCtx = overlayCanvasRef.current.getContext("2d");
      if (overlayCtx) {
        drawFacialFeatures(
          overlayCtx,
          faceDetection,
          videoRef.current.videoWidth,
          videoRef.current.videoHeight,
          performance.now()
        );
      }

      if (allConditionsMet) {
        try {
          console.log("[Frame] Processing vital signs...");
          const heartRateData = await heartRateDetectorRef.current.update(
            videoRef.current,
            faceDetection,
            detectedFaceOverlayRef
          );

          if (heartRateData) {
            console.log("[Frame] Raw heart rate data:", heartRateData);
          }

          const bloodPressure = await (async () => {
            try {
              if (now - lastBPUpdateRef.current >= 200) {
                if (!videoRef.current || !bloodPressureEstimatorRef.current) {
                  console.log("Missing refs for BP estimation");
                  return "--/--";
                }
                const bp = await bloodPressureEstimatorRef.current.update(
                  videoRef.current,
                  faceDetection
                );
                console.log("Blood pressure reading:", bp);
                lastBPUpdateRef.current = now;
                return bp;
              }
              return "--/--";
            } catch (error) {
              console.error("Error in blood pressure estimation:", error);
              return "--/--";
            }
          })();

          const heartRate = heartRateData?.heartRate ?? 0;
          const validHeartRate =
            heartRate >= 40 && heartRate <= 200 ? Math.round(heartRate) : 0;
          const hrv = heartRateData?.hrv ?? 0;
          const validHrv = hrv >= 10 && hrv <= 150 ? hrv : 0;

          let bloodGlucose = 0;
          if (validHeartRate > 0 && bloodPressure !== "--/--") {
            try {
              const [systolic, diastolic] = bloodPressure
                .split("/")
                .map(Number);
              if (!isNaN(systolic) && !isNaN(diastolic)) {
                bloodGlucose = estimateBloodGlucose(
                  validHeartRate,
                  systolic,
                  diastolic
                );
              }
            } catch (error) {
              console.error("Error calculating blood glucose:", error);
            }
          }

          if (validHeartRate > 0 || validHrv > 0) {
            vitalMeasurementsRef.current.addReading({
              heartRate: validHeartRate,
              bloodPressure: bloodPressure,
              hrv: Math.floor(validHrv * 10) / 10,
              bloodGlucose: bloodGlucose,
            });

            const report = vitalMeasurementsRef.current.getFinalReport();

            onVitalsUpdate?.({
              heartRate: report.averageHeartRate || validHeartRate,
              bloodPressure: report.averageBloodPressure || bloodPressure,
              hrv: report.averageHRV || Math.floor(validHrv * 10) / 10,
              bloodGlucose: report.averageBloodGlucose || bloodGlucose,
              heartRateHistory: heartRateData?.history ?? [],
            });

            const newRealTimeHeartRate =
              report.averageHeartRate || validHeartRate;
            console.log("NEW REAL TIME HEART RATE", newRealTimeHeartRate);
            setRealTimeHeartRate(newRealTimeHeartRate);
          }
        } catch (error) {
          console.error("[Frame] Error processing vitals:", error);
        }
      } else {
        console.log("[Frame] Conditions not met for vital signs processing");
      }

      // Update last frame data for next comparison
      setLastFrameData(currentFrameData);

      animationFrameRef.current = requestAnimationFrame(processFrame);
    } catch (error) {
      console.error("Error in frame processing:", error);
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  };

  const stopVideo = () => {
    setVideoStarted(false);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => {
        track.stop();
        stream.removeTrack(track);
      });
      videoRef.current.srcObject = null;
      onStreamStart(null);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    startTimeRef.current = null;
    lastElapsedTimeRef.current = 0;
    setProgress(0);
  };

  const handleCancel = () => {
    stopVideo();
    onCancel?.();
    handleReset();

    // Clear overlay canvas
    if (overlayCanvasRef.current) {
      const overlayContext = overlayCanvasRef.current.getContext("2d");
      if (overlayContext) {
        overlayContext.clearRect(
          0,
          0,
          overlayCanvasRef.current.width,
          overlayCanvasRef.current.height
        );
      }
    }
  };

  const startVideo = async () => {
    console.log("Starting video stream...");
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setVideoStarted(true);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Video capture is not supported in your browser");
      }

      heartRateDetectorRef.current = new HeartRateDetector();
      bloodPressureEstimatorRef.current = new BloodPressureEstimator();

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
            frameRate: { ideal: 30, min: 25 },
          },
          audio: false,
        });
      } catch (e) {
        console.log("Falling back to basic video constraints");
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      console.log("Camera access granted");

      if (videoRef.current && overlayCanvasRef.current) {
        videoRef.current.srcObject = stream;
        onStreamStart(stream);

        const updateCanvasDimensions = () => {
          if (
            videoRef.current &&
            overlayCanvasRef.current &&
            debugCanvasRef.current
          ) {
            overlayCanvasRef.current.width = videoRef.current.videoWidth;
            overlayCanvasRef.current.height = videoRef.current.videoHeight;
            debugCanvasRef.current.width = videoRef.current.videoWidth;
            debugCanvasRef.current.height = videoRef.current.videoHeight;
          }
        };

        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded");
          updateCanvasDimensions();
          videoRef.current?.play();
        };

        videoRef.current.onplaying = () => {
          console.log("Video started playing, beginning vital detection");
          setProgress(0);

          animationFrameRef.current = requestAnimationFrame(processFrame);

          if (timerRef.current) {
            clearInterval(timerRef.current);
          }

          timerRef.current = setInterval(() => {
            // Progress is now handled within processFrame
          }, 100);
        };
      }
    } catch (error) {
      console.error("Error starting video:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to access camera. Please ensure camera permissions are enabled.";

      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Camera Access Error",
        description: errorMessage,
      });
      onStreamStart(null);
    } finally {
      setIsLoading(false);
    }
  };

  const drawFacialFeatures = (
    ctx: CanvasRenderingContext2D,
    face: any,
    videoWidth: number,
    videoHeight: number,
    timestamp: number
  ) => {
    // const { boxWidth, boxHeight } = maintainAspectRatio(videoWidth, videoHeight);
    const isPortrait = videoHeight > videoWidth;

    // const centerX = ctx.canvas.width / 2;
    // const centerY = ctx.canvas.height / 2;

    // const x = centerX - boxWidth / 2;
    // const y = centerY - boxHeight / 2;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Maintain correct orientation for guidance box
    ctx.save();

    // Maintain a fixed aspect ratio for the guidance box (e.g., 4:3)
    let boxAspectRatio = 16 / 9;
    if (isPortrait) {
      boxAspectRatio = 9 / 16;
    }

    let boxWidth = ctx.canvas.width * 0.7; // Scale relative to canvas width
    let boxHeight = boxWidth / boxAspectRatio;

    // Ensure the box fits within the canvas
    if (boxHeight > ctx.canvas.height) {
      const scalingFactor = ctx.canvas.height / boxHeight;
      boxWidth *= scalingFactor;
      boxHeight *= scalingFactor;
    }

    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const x = centerX - boxWidth / 2;
    const y = centerY - boxHeight / 2;

    const cornerLength = Math.min(boxWidth, boxHeight) * 0.2;
    const lineWidth = Math.max(2, Math.min(boxWidth, boxHeight) * 0.05);
    ctx.lineWidth = lineWidth;

    let isFaceAligned = false;
    // Ensure `faceBox` coordinates are scaled to the canvas dimensions
    if (face?.detection) {
      const faceBox = {
        x: (face.detection.box.x * ctx.canvas.width) / videoWidth,
        y: (face.detection.box.y * ctx.canvas.height) / videoHeight,
        width: (face.detection.box.width * ctx.canvas.width) / videoWidth,
        height: (face.detection.box.height * ctx.canvas.height) / videoHeight,
      };

      const boxRegion = {
        left: x,
        right: x + boxWidth,
        top: y,
        bottom: y + boxHeight,
      };

      // Check if the face box fits within the guidance box with a tolerance margin
      const marginX = boxWidth * 0.1;
      const marginY = boxHeight * 0.1;

      isFaceAligned =
        faceBox.x > boxRegion.left - marginX &&
        faceBox.x + faceBox.width < boxRegion.right + marginX &&
        faceBox.y > boxRegion.top - marginY &&
        faceBox.y + faceBox.height < boxRegion.bottom + marginY;
    }

    // Debugging: Log box dimensions and face alignment status
    console.debug("Box Dimensions:", { boxWidth, boxHeight, x, y });
    console.debug("Is Face Aligned:", isFaceAligned);
    if (face?.detection) {
      console.debug("Face Detection Box:", face.detection.box);
    }

    ctx.strokeStyle = isFaceAligned
      ? "rgba(74, 222, 128, 0.8)"
      : "rgba(239, 68, 68, 0.8)";

    ctx.beginPath();

    // Top-left corner
    ctx.moveTo(x, y + cornerLength);
    ctx.lineTo(x, y);
    ctx.lineTo(x + cornerLength, y);

    // Top-right corner
    ctx.moveTo(x + boxWidth - cornerLength, y);
    ctx.lineTo(x + boxWidth, y);
    ctx.lineTo(x + boxWidth, y + cornerLength);

    // Bottom-right corner
    ctx.moveTo(x + boxWidth, y + boxHeight - cornerLength);
    ctx.lineTo(x + boxWidth, y + boxHeight);
    ctx.lineTo(x + boxWidth - cornerLength, y + boxHeight);

    // Bottom-left corner
    ctx.moveTo(x + cornerLength, y + boxHeight);
    ctx.lineTo(x, y + boxHeight);
    ctx.lineTo(x, y + boxHeight - cornerLength);

    ctx.stroke();
  };

  // Add startTimeRef for progress tracking
  const startTimeRef = useRef<number | null>(null);
  const lastElapsedTimeRef = useRef<number>(0);

  const [isMonitoring, setIsMonitoring] = useState(false);
  

  useEffect(() => {
    if (progress >= 100) {
      stopVideo();
      setIsMonitoring(false);
      const finalReport = vitalMeasurementsRef.current.getFinalReport();
      console.log("Final vital signs report:", finalReport);
      onComplete?.(finalReport);
    }
  }, [progress, onComplete]);

  useEffect(() => {
    return () => {
      stopVideo();
      vitalMeasurementsRef.current.clear();
    };
  }, []);

  // useEffect(() => {
  //   console.log("Initializing face detection...");
  //   loadFaceDetectionModels()
  //     .then(() => {
  //       console.log("Face detection models loaded successfully");
  //       setIsModelLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error("Error loading face detection models:", error);
  //       setError(
  //         "Failed to load face detection models. Please check console for details."
  //       );
  //       setIsModelLoading(false);
  //     });

  //   return () => {
  //     console.log("Cleaning up video resources...");
  //     stopVideo();
  //   };
  // }, []);

  // if (isModelLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen p-8">
  //       <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
  //       <span>Loading...</span>
  //     </div>
  //   );
  // }
  const [heartRateReplit, setHeartRateReplit] = useState<VitalReading[]>([]);
  const [bloodPressure, setBloodPressure] = useState<BloodPressureReading[]>([]);
  const [bloodGlucose, setBloodGlucose] = useState<VitalReading[]>([]);
  const [hrv, setHRV] = useState<VitalReading[]>([]);
  const [signalQuality, setSignalQuality] = useState<number>(0);
  
  const [timeLeft, setTimeLeft] = useState(0); // Time left in seconds
  const [isRunning, setIsRunning] = useState(false); // To track if the timer is running
  const totalTime = 30; // Total duration of the timer
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    if (!isRunning || timeLeft === 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime > 1) {
          let prog = ((totalTime - prevTime) / totalTime) * 100;
          console.log('progressing.....', prog)
          setProgressPercentage(((totalTime - timeLeft) / totalTime) * 100);
          return prevTime - 1;
        } else {
          handleStopMonitoring();
          clearInterval(timerId); // Clear the timer when it ends
          setIsRunning(false);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timerId); // Cleanup interval
  }, [isRunning, timeLeft]);

  const handleStartMonitoring = () => {
    setTimeLeft(totalTime);
    setIsRunning(true); // Start the timer
    setIsMonitoring(true);
  }

  const handleCancelMonitoring = () => {
    setIsMonitoring(false);
    setTimeLeft(0); // Reset time to 0
    setIsRunning(false);
  }

  const handleStopMonitoring = () => {
    setIsMonitoring(false);
    console.warn('FINAL REPORT: ', {
      heart: Math.round(heartRateReplit[heartRateReplit.length - 1].value),
      bp: `${Math.round(bloodPressure[bloodPressure.length - 1].systolic)}/${Math.round(bloodPressure[bloodPressure.length - 1].diastolic)}`,
      bg: Math.round(bloodGlucose[bloodGlucose.length - 1].value),
      hrv: 0,
    });
    onComplete?.({
      averageBloodPressure: `${Math.round(bloodPressure[bloodPressure.length - 1].systolic)}/${Math.round(bloodPressure[bloodPressure.length - 1].diastolic)}`,
      averageBloodGlucose: Math.round(bloodGlucose[bloodGlucose.length - 1].value),
      averageHeartRate: Math.round(heartRateReplit[heartRateReplit.length - 1].value),
      averageHRV: 0,
      confidence: 50,
      totalReadings: 10
    });
  }

  useEffect(() => {
    if (!isMonitoring) {
      // Clear readings when monitoring stops
      setHeartRateReplit([]);
      setBloodPressure([]);
      setBloodGlucose([]);
      setSignalQuality(0);
      return;
    }

    const unsubscribe = subscribeToVitals((vitals) => {
      const { timestamp, heartRate: hr, bloodPressure: bp, bloodGlucose: bg, hrv: hrvValue, signalQuality: sq } = vitals;
      setSignalQuality(sq);

      if (hr !== null) {
        setHeartRateReplit(prev => [...prev.slice(-30), { timestamp, value: hr }]);
      }

      if (bp.systolic !== null && bp.diastolic !== null) {
        setBloodPressure(prev => [
          ...prev.slice(-30), 
          { 
            timestamp,
            systolic: bp.systolic ?? 0,
            diastolic: bp.diastolic ?? 0
          }
        ]);
      }

      if (bg !== null) {
        setBloodGlucose(prev => [...prev.slice(-30), { timestamp, value: bg }]);
      }

      if (hrvValue !== null) {
        setHRV(prev => [...prev.slice(-30), { timestamp, value: hrvValue }]);
      }
    });

    return () => unsubscribe();
  }, [isMonitoring]);

  return (
    <div className="flex flex-col items-center space-y-4 bg-gray-100 h-[calc(100vh-65px)] p-4">
      <Card className="overflow-hidden bg-gray-900 w-full max-w-[400px] h-[calc(100vh-60px)] sm:h-screen relative rounded-lg">
        <WebcamFeed isActive={isMonitoring} />

        

        {/* Overlay Icons */}
        {/* <div className="absolute top-4 left-4 flex items-center gap-2">
          <Info className="h-6 w-6 text-white" />
        </div> */}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}

        {isMonitoring && (
          <>
            <div className="absolute bottom-0 left-0 w-full px-4 py-2 bg-gray-800">
              <div className="flex items-center gap-2">
                <CustomProgress
                  value={progressPercentage}
                  className="w-full bg-white"
                  color="#44c569"
                >
                  <div
                    className="absolute text-sm font-medium text-white"
                    style={{
                      left: `${progressPercentage}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    {Math.round(progress)}%
                  </div>
                </CustomProgress>
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleCancelMonitoring}
              className="absolute top-2 right-4 rounded-full bg-red-600"
            >
              <X className="h-4 w-4" color="white" />
            </Button>
          </>
        )}
      </Card>

      {/* Start Button */}
      <Button
        disabled={isMonitoring}
        onClick={handleStartMonitoring}
        className="bg-teal-500 text-white py-2 px-8 rounded-lg shadow-md hover:bg-teal-600 focus:ring focus:ring-teal-300"
      >
        START
      </Button>

      {/* <Card>
            <CardContent className="p-6">
              <VitalsDisplay isMonitoring={isMonitoring} />
            </CardContent>
          </Card> */}

      {/* Measurements Section */}
      <div className="flex justify-around w-full bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-600">PULSE</span>
          <span className="text-2xl font-bold text-black">
          {heartRateReplit.length && signalQuality >= 0.3 
                ? Math.round(heartRateReplit[heartRateReplit.length - 1].value)
                : "--"}
          </span>
          <span className="text-xs text-gray-500">bpm</span>
        </div>
      </div>

      {/* Status Message */}
      <div className="flex justify-around w-full bg-white px-4 py-6 rounded-lg shadow-sm">
        {videoRef.current?.srcObject && (
          <>
            {false && !conditions.isStable && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Keep your device steady for accurate measurements
                </p>
              </div>
            )}

            {!conditions.hasGoodLighting && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Move to a better lit area
                </p>
              </div>
            )}

            {conditions.hasGoodLighting &&
              (!conditions.hasFace || !conditions.isWellPositioned) && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Position your face within the frame guides
                  </p>
                </div>
              )}

            {isMonitoring && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-green-800">Measuring...</p>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}

const estimateBloodGlucose = (
  heartRate: number,
  systolic: number,
  diastolic: number
): number => {
  if (!heartRate || !systolic || !diastolic) {
    console.log("Missing vital signs for glucose estimation:", {
      heartRate,
      systolic,
      diastolic,
    });
    return 0;
  }

  const baseGlucose = 100;

  const hrFactor = Math.max(-15, Math.min(15, (70 - heartRate) * 0.4));

  const meanBP = (systolic + 2 * diastolic) / 3;
  const optimalMeanBP = 93;
  const bpDeviation = Math.abs(meanBP - optimalMeanBP);
  const bpFactor = Math.min(20, bpDeviation * 0.5);

  const pulsePressure = systolic - diastolic;
  const ppFactor = Math.max(-10, Math.min(10, (pulsePressure - 40) * 0.3));

  let glucose = baseGlucose + hrFactor + bpFactor + ppFactor;

  glucose = Math.max(70, Math.min(180, glucose));

  console.log("Blood glucose estimation:", {
    baseGlucose,
    hrFactor,
    bpFactor,
    ppFactor,
    finalGlucose: Math.round(glucose),
  });

  return Math.round(glucose);
};
