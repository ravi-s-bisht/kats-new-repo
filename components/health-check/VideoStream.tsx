import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Video, Camera, AlertCircle, Loader2, X, Mic } from "lucide-react";

interface VideoStreamProps {
  onStreamStart: (stream: MediaStream | null) => void;
  onComplete?: () => void;
}

export default function VideoStream({ onStreamStart, onComplete }: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const stopVideo = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      onStreamStart(null);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimeLeft(null);
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

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: true
      });

      console.log('Camera and microphone access granted');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        onStreamStart(stream);

        // Start the timer when video starts playing
        videoRef.current.onplaying = () => {
          console.log('Video started playing, starting timer');
          setTimeLeft(30);

          // Clear any existing timer
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }

          // Set up new timer
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
        : "Unable to access camera and microphone. Please ensure permissions are enabled.";

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
    if (timeLeft === null) return;

    if (timeLeft === 0) {
      stopVideo();
      onComplete?.();
      return;
    }
  }, [timeLeft, onComplete]);

  useEffect(() => {
    return () => {
      stopVideo();
    };
  }, []);

  return (
    <div className="space-y-6">
      {timeLeft !== null && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <div className="flex items-center">
            <Mic className="h-5 w-5 text-blue-500 mr-2" />
            <p className="text-sm text-blue-700">
              Please speak naturally during the recording. Your voice helps us analyze your well-being more accurately.
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
              onClick={stopVideo}
              className="rounded-full"
            >
              <X className="h-4 w-4" />
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

      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          onClick={startVideo}
          disabled={isLoading || timeLeft !== null}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Video className="h-5 w-5" />
          )}
          {isLoading ? "Starting Camera..." : "Start Camera & Microphone"}
        </Button>
      </div>
    </div>
  );
}