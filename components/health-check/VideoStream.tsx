import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Video, Camera, AlertCircle, Loader2, X } from "lucide-react";
import { detectFace, isFaceWellPositioned, loadFaceDetectionModels } from "@/src/lib/faceDetection";
import TutorialOverlay from "./TutorialOverlay";
import { motion, AnimatePresence } from "framer-motion";

interface VideoStreamProps {
  onStreamStart: (stream: MediaStream | null) => void;
}

export default function VideoStream({ onStreamStart }: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout>();
  const detectionRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsModelLoading(true);
        await loadFaceDetectionModels();
        console.log('Face detection models loaded successfully');
        setIsModelLoading(false);
      } catch (error) {
        console.error('Error loading face detection models:', error);
        setError('Failed to initialize face detection. Please refresh the page.');
        setIsModelLoading(false);
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const cancelCheck = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (detectionRef.current) {
      clearInterval(detectionRef.current);
    }
    setTimeLeft(null);
    setIsFaceDetected(false);
    onStreamStart(null);
  };

  const setupCanvas = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const updateCanvasSize = () => {
      if (canvas && video) {
        canvas.width = video.videoWidth || video.clientWidth;
        canvas.height = video.videoHeight || video.clientHeight;
        canvas.style.width = `${video.clientWidth}px`;
        canvas.style.height = `${video.clientHeight}px`;
      }
    };

    video.addEventListener('loadedmetadata', updateCanvasSize);
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      video.removeEventListener('loadedmetadata', updateCanvasSize);
      window.removeEventListener('resize', updateCanvasSize);
    };
  };

  const startVideo = async () => {
    console.log('Starting video...');
    setIsLoading(true);
    setError(null);
    setTimeLeft(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Video capture is not supported in your browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false
      });

      console.log('Camera access granted, setting up video stream');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setupCanvas();

        // Call onStreamStart immediately after setting up the stream
        onStreamStart(stream);

        videoRef.current.onplaying = () => {
          console.log('Video started playing, initializing face detection');
          startFaceDetection();
          setTimeLeft(30);
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

  const startFaceDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;

    console.log('Starting face detection interval');
    detectionRef.current = setInterval(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState !== 4) return;

      try {
        const detection = await detectFace(video);
        const isWellPositioned = isFaceWellPositioned(
          detection,
          video.videoWidth || video.clientWidth,
          video.videoHeight || video.clientHeight
        );

        setIsFaceDetected(isWellPositioned);

        const context = canvas.getContext('2d');
        if (!context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);

        if (detection) {
          const box = detection.detection.box;
          context.strokeStyle = isWellPositioned ? '#4ade80' : '#f87171';
          context.lineWidth = 3;
          context.strokeRect(box.x, box.y, box.width, box.height);
        }
      } catch (error) {
        console.error('Error in face detection interval:', error);
      }
    }, 100);
  };

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft === 0) {
      cancelCheck();
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft(prev => prev !== null ? prev - 1 : null);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      cancelCheck();
    };
  }, []);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {showTutorial && (
        <TutorialOverlay onClose={() => {
          setShowTutorial(false);
          localStorage.setItem('hasSeenTutorial', 'true');
        }} />
      )}

      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl mt-5 font-semibold text-gray-900 mb-2">
          Video Check-in
        </h2>
        <p className="text-gray-600">
          Please ensure good lighting
        </p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="overflow-hidden bg-gray-900 aspect-video relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none w-full h-full"
          />

          <AnimatePresence>
            {!videoRef.current?.srcObject && !isLoading && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Camera className="h-16 w-16 text-gray-400" />
              </motion.div>
            )}

            {isLoading && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center bg-gray-900/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </motion.div>
            )}

            {timeLeft !== null && (
              <motion.div 
                className="absolute top-4 right-4 flex items-center gap-2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
              >
                <div className="bg-black/70 text-white px-4 py-2 rounded-full font-mono text-xl">
                  {timeLeft}s
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={cancelCheck}
                  className="rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {false && error && (
        <motion.div 
          className="flex items-center gap-2 text-sm text-red-600 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </motion.div>
      )}

      <motion.div 
        className="flex justify-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          size="lg"
          onClick={startVideo}
          disabled={isLoading || timeLeft !== null || isModelLoading}
          className="gap-2"
        >
          {isLoading || isModelLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Video className="h-5 w-5" />
          )}
          {isModelLoading 
            ? "Loading Face Detection..." 
            : isLoading 
              ? "Starting Camera..." 
              : "Start Camera"}
        </Button>
      </motion.div>

      <motion.div 
        className="flex justify-center items-center gap-2 text-sm text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <AlertCircle className="h-4 w-4" />
        <span>Your video stream is secure and not recorded</span>
      </motion.div>
    </motion.div>
  );
}