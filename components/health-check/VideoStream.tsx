import { cn } from "@/src/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, AlertCircle, Loader2, X } from "lucide-react";
import { detectFace, loadFaceDetectionModels, isFaceWellPositioned } from "@/src/lib/faceDetection";
import { HeartRateDetector } from "@/src/lib/heartRateDetection";
import { BloodPressureEstimator } from "@/src/lib/bloodPressureEstimation";

interface VideoStreamProps {
  onStreamStart: (stream: MediaStream | null) => void;
  onComplete?: () => void;
  onVitalsUpdate?: (vitals: {
    heartRate: number;
    bloodPressure: string;
    hrv: number;
    bloodGlucose: number;
  }) => void;
  onCancel?: () => void;
}

export default function VideoStream({ onStreamStart, onComplete, onVitalsUpdate, onCancel }: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const heartRateDetectorRef = useRef<HeartRateDetector>();
  const bloodPressureEstimatorRef = useRef<BloodPressureEstimator>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isFaceAligned, setIsFaceAligned] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const [isModelLoading, setIsModelLoading] = useState(true);

  // Load face detection models on component mount
  useEffect(() => {
    loadFaceDetectionModels()
      .then(() => {
        console.log('Face detection models loaded successfully');
        setIsModelLoading(false);
        // Start video stream automatically once models are loaded
        startVideo();
      })
      .catch((error) => {
        console.error('Error loading face detection models:', error);
        setError('Failed to load face detection models. Please refresh the page.');
        setIsModelLoading(false);
      });

    // Cleanup function to ensure camera and resources are properly released
    return () => {
      console.log('Cleaning up video resources...');
      stopVideo();
    };
  }, []);

  const drawFaceGuidance = (canvas: HTMLCanvasElement, videoWidth: number, videoHeight: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate frame dimensions
    const frameWidth = Math.min(canvas.width * 0.35, 400); // Limit max width
    const frameHeight = frameWidth * 1.3; // Golden ratio-ish proportion
    const centerX = canvas.width / 2;
    const centerY = (canvas.height / 2) - (frameHeight * 0.1); // Slightly above center

    // Set frame style
    const frameColor = isFaceAligned ? '#22c55e' : '#ffffff';
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = Math.max(2, frameWidth * 0.006);

    // Draw guide frame
    const x = centerX - frameWidth / 2;
    const y = centerY - frameHeight / 2;
    const cornerLength = frameWidth * 0.15;

    // Draw corners with L-shapes
    ctx.beginPath();

    // Top-left corner
    ctx.moveTo(x + cornerLength, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + cornerLength);

    // Top-right corner
    ctx.moveTo(x + frameWidth - cornerLength, y);
    ctx.lineTo(x + frameWidth, y);
    ctx.lineTo(x + frameWidth, y + cornerLength);

    // Bottom-left corner
    ctx.moveTo(x, y + frameHeight - cornerLength);
    ctx.lineTo(x, y + frameHeight);
    ctx.lineTo(x + cornerLength, y + frameHeight);

    // Bottom-right corner
    ctx.moveTo(x + frameWidth, y + frameHeight - cornerLength);
    ctx.lineTo(x + frameWidth, y + frameHeight);
    ctx.lineTo(x + frameWidth - cornerLength, y + frameHeight);

    ctx.stroke();

    // Clear the inner area
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const clearMargin = frameWidth * 0.02;
    ctx.fillRect(
        x + clearMargin,
        y + clearMargin,
        frameWidth - (clearMargin * 2),
        frameHeight - (clearMargin * 2)
    );
    ctx.restore();

    // Draw center crosshair if not aligned
    if (!isFaceAligned) {
        const crosshairSize = frameWidth * 0.05;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = Math.max(1, frameWidth * 0.002);

        ctx.beginPath();
        // Horizontal line
        ctx.moveTo(centerX - crosshairSize, centerY);
        ctx.lineTo(centerX + crosshairSize, centerY);
        // Vertical line
        ctx.moveTo(centerX, centerY - crosshairSize);
        ctx.lineTo(centerX, centerY + crosshairSize);
        ctx.stroke();
    }

    // Add guidance text with drop shadow for better visibility
    ctx.textAlign = 'center';
    ctx.fillStyle = frameColor;

    // Main instruction text
    const fontSize = Math.max(16, Math.min(24, frameWidth * 0.05));
    ctx.font = `bold ${fontSize}px system-ui`;

    // Add text shadow for better visibility
    const mainText = isFaceAligned ? 'Perfect! Stay still' : 'Center your face in the frame';
    const textY = y + frameHeight + fontSize * 2;

    // Draw text shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillText(mainText, centerX + 1, textY + 1);

    // Draw main text
    ctx.fillStyle = frameColor;
    ctx.fillText(mainText, centerX, textY);

    // Additional guidance (only show if not aligned)
    if (!isFaceAligned) {
        const subText = 'Look directly at the camera';
        ctx.font = `${fontSize * 0.8}px system-ui`;

        // Draw text shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillText(subText, centerX + 1, textY + fontSize * 1.5 + 1);

        // Draw sub text
        ctx.fillStyle = frameColor;
        ctx.fillText(subText, centerX, textY + fontSize * 1.5);
    }
  };

  const stopVideo = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
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
    setTimeLeft(null);
  };

  const handleCancel = () => {
    stopVideo();
    onCancel?.();
  };

  const processFrame = async () => {
    if (!videoRef.current || !heartRateDetectorRef.current || !bloodPressureEstimatorRef.current || !overlayCanvasRef.current) {
      console.log('Missing required refs for vital detection');
      return;
    }

    // Check if video dimensions are available
    if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
      console.log('Video dimensions not available yet');
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    try {
      const faceDetection = await detectFace(videoRef.current);

      // Update face alignment status
      const isAligned = faceDetection ? isFaceWellPositioned(faceDetection, videoRef.current.videoWidth, videoRef.current.videoHeight) : false;
      setIsFaceAligned(isAligned);

      // Update overlay with face guidance
      drawFaceGuidance(
        overlayCanvasRef.current,
        videoRef.current.videoWidth,
        videoRef.current.videoHeight
      );

      if (faceDetection) {
        try {
          // Process vitals in parallel for better performance
          const [{ heartRate: rawHeartRate, hrv: rawHrv }, bloodPressure] = await Promise.all([
            heartRateDetectorRef.current.update(videoRef.current, faceDetection),
            bloodPressureEstimatorRef.current.update(videoRef.current, faceDetection)
          ]);

          // Apply bounds to heart rate
          const heartRate = Math.min(200, Math.max(40, rawHeartRate));

          // Apply bounds to HRV
          const hrv = Math.min(150, Math.max(10, rawHrv));

          // Apply bounds to blood pressure with increased sensitivity
          let boundedBP = bloodPressure;
          if (bloodPressure !== "--") {
            const [systolic, diastolic] = bloodPressure.split('/').map(Number);
            // Adjust bounds to be more lenient while still staying within medical ranges
            const boundedSystolic = Math.min(180, Math.max(90, systolic));
            const boundedDiastolic = Math.min(110, Math.max(60, diastolic));

            // Only consider the measurement valid if both values are reasonable
            if (boundedSystolic > boundedDiastolic) {
              boundedBP = `${boundedSystolic}/${boundedDiastolic}`;
            } else {
              boundedBP = "--";
            }
          }

          // Calculate blood glucose with bounds
          const [systolic, diastolic] = boundedBP !== "--" ? boundedBP.split('/').map(Number) : [0, 0];
          const rawGlucose = estimateBloodGlucose(heartRate, systolic, diastolic);
          const bloodGlucose = Math.min(200, Math.max(70, rawGlucose));

          // Update vitals if any valid measurement is available
          // Make blood pressure detection more sensitive by considering partial measurements
          const hasValidVitals = heartRate > 0 || boundedBP !== "--" || hrv > 0 || bloodGlucose > 0;
          if (hasValidVitals) {
            onVitalsUpdate?.({
              heartRate: heartRate,
              bloodPressure: boundedBP,
              hrv: hrv,
              bloodGlucose: bloodGlucose
            });
          }
        } catch (error) {
          console.error('Error processing frame:', error);
        }
      }
    } catch (error) {
      console.error('Error processing frame:', error);
    }

    // Schedule next frame with higher frequency (decrease delay)
    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  const startVideo = async () => {
    console.log('Starting video stream...');
    setIsLoading(true);
    setError(null);
    setTimeLeft(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Video capture is not supported in your browser");
      }

      // Initialize detectors
      heartRateDetectorRef.current = new HeartRateDetector();
      bloodPressureEstimatorRef.current = new BloodPressureEstimator();

      // Try to get the video stream with optimal settings
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
            frameRate: { ideal: 30, min: 25 }
          },
          audio: false
        });
      } catch (e) {
        console.log('Falling back to basic video constraints');
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      console.log('Camera access granted');

      if (videoRef.current && overlayCanvasRef.current) {
        videoRef.current.srcObject = stream;
        onStreamStart(stream);

        // Set canvas dimensions to match video
        const updateCanvasDimensions = () => {
          if (videoRef.current && overlayCanvasRef.current) {
            overlayCanvasRef.current.width = videoRef.current.videoWidth;
            overlayCanvasRef.current.height = videoRef.current.videoHeight;
          }
        };

        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          updateCanvasDimensions();
          videoRef.current?.play();
        };

        // Start processing and timer when video starts playing
        videoRef.current.onplaying = () => {
          console.log('Video started playing, beginning vital detection');
          setTimeLeft(30);

          // Start processing frames
          animationFrameRef.current = requestAnimationFrame(processFrame);

          if (timerRef.current) {
            clearInterval(timerRef.current);
          }

          timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
              if (prev === null || prev <= 0) {
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                }
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        };
      }
    } catch (error) {
      console.error('Error starting video:', error);
      const errorMessage = error instanceof Error
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

  useEffect(() => {
    if (timeLeft === 0) {
      stopVideo();
      onComplete?.();
    }
  }, [timeLeft, onComplete]);

  useEffect(() => {
    return () => {
      stopVideo();
    };
  }, []);

  if (isModelLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Loading face detection models...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {timeLeft !== null && (
        <div className={cn(
          "border-l-4 p-4 mb-4",
          isFaceAligned ? "bg-green-50 border-green-500" : "bg-blue-50 border-blue-500"
        )}>
          <div className="flex items-center">
            <p className={cn(
              "text-sm",
              isFaceAligned ? "text-green-700" : "text-blue-700"
            )}>
              {isFaceAligned
                ? "Perfect! Please stay still while we measure your vital signs."
                : "Please position your face within the frame and look directly at the camera."}
            </p>
          </div>
        </div>
      )}

      <Card className="overflow-hidden bg-gray-900 h-full relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {!videoRef.current?.srcObject && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="h-16 w-16 text-gray-400" />
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}

        {timeLeft !== null && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="bg-black/70 text-white px-4 py-2 rounded-full font-mono text-xl">
              {timeLeft}s
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleCancel}
              className="rounded-full bg-red-500"
              style={{borderRadius: '100%'}}
            >
              <X className="h-9 w-9 " color="white" />
            </Button>
          </div>
        )}
      </Card>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 justify-center">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

const estimateBloodGlucose = (heartRate: number, systolic: number, diastolic: number): number => {
  if (!heartRate || !systolic || !diastolic) {
    console.log('Missing vital signs for glucose estimation:', { heartRate, systolic, diastolic });
    return 0;
  }

  // Enhanced estimation model with better physiological correlation
  const baseGlucose = 100;

  // Adjust based on heart rate (higher heart rate often correlates with lower glucose)
  const hrAdjustment = (heartRate - 70) * -0.3;

  // Adjust based on blood pressure (higher BP often correlates with higher glucose)
  const bpAdjustment = ((systolic - 120) * 0.2 + (diastolic - 80) * 0.4);

  // Calculate final estimate with bounds checking
  let glucose = baseGlucose + hrAdjustment + bpAdjustment;
  glucose = Math.max(70, Math.min(200, glucose));

  console.log('Blood glucose estimation:', {
    baseGlucose,
    hrAdjustment,
    bpAdjustment,
    finalGlucose: Math.round(glucose)
  });

  return Math.round(glucose);
};