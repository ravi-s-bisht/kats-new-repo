import { useEffect, useRef } from "react";
import { processVideoFrame } from "@/src/lib/vitals-processor";

interface WebcamFeedProps {
  isActive: boolean;
  stream?: MediaStream | null;
}

export function WebcamFeed({ isActive, stream }: WebcamFeedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrame: number;

    async function startWebcam() {
      try {
        if (!stream) throw new Error("No stream available");

        // If a stream is passed, process it
        const videoTrack = stream.getVideoTracks()[0];
        const videoTrackSettings = videoTrack?.getSettings();

        // Initialize canvas for frame processing
        if (canvasRef.current) {
          const context = canvasRef.current.getContext("2d");
          if (context) {
            // Optionally set canvas size based on the stream resolution
            canvasRef.current.width = videoTrackSettings?.width ?? 1280;
            canvasRef.current.height = videoTrackSettings?.height ?? 720;
          }
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    }

    function processFrame() {
      if (canvasRef.current && isActive) {
        const context = canvasRef.current.getContext("2d");
        if (context && stream) {
          // Draw the current video frame to the canvas
          const videoElement = document.createElement("video");
          videoElement.srcObject = stream;
          videoElement.play();

          videoElement.onplaying = () => {
            if (canvasRef.current) {
              context.drawImage(
                videoElement,
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

              processVideoFrame(imageData); // Process the frame
              animationFrame = requestAnimationFrame(processFrame);
            }
          };
        }
      }
    }

    if (isActive) {
      startWebcam();
      processFrame();
    }

    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      // clean up canvas
      if (canvasRef.current) {
        const context = canvasRef.current.getContext("2d");
        if (context) {
          context.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
        }
      }
    };
  }, [isActive, stream]);

  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        const context = canvasRef.current.getContext("2d");
        if (context) {
          context.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
        }
      }
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="hidden absolute inset-0 w-full h-full"
        width="1280"
        height="720"
      />
    </>
  ); // Return nothing, no DOM elements are needed
}
