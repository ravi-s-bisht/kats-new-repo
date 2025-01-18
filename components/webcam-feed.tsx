import { useEffect, useRef } from "react";
import { processVideoFrame } from "@/src/lib/vitals-processor";

interface WebcamFeedProps {
  isActive: boolean;
}

export function WebcamFeed({ isActive }: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrame: number;

    async function startWebcam() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 720 },
            height: { ideal: 1280 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    }

    function processFrame() {
      if (videoRef.current && canvasRef.current && isActive) {
        const context = canvasRef.current.getContext("2d");
        if (context) {
          context.drawImage(
            videoRef.current,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          const imageData = context.getImageData(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          processVideoFrame(imageData);
        }
        animationFrame = requestAnimationFrame(processFrame);
      }
    }

    if (isActive) {
      startWebcam();
      processFrame();
    }

    const currentCanvas = canvasRef.current;
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      // Clear the canvas to black when the video stops
      if (currentCanvas) {
        const context = currentCanvas.getContext("2d");
        if (context) {
          context.fillStyle = "black";
          context.fillRect(0, 0, currentCanvas.width, currentCanvas.height);
        }
      }
    };
  }, [isActive]);

  return (
    <div className="relative w-full h-full aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        width="1280"
        height="720"
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
          Click Start to begin
        </div>
      )}
    </div>
  );
}
