"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import VideoStream from "@/components/health-check/VideoStream";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/src/lib/queryClient";

export default function Home() {
  const [stream, setStream] = useState<MediaStream | null>(null);

  const handleVideoStart = (videoStream: MediaStream | null) => {
    console.log(
      "Video stream state changed:",
      videoStream ? "active" : "inactive"
    );
    setStream(videoStream);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Medical Check-in
            </h1>
            <p className="text-gray-600">Complete your video verification</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <VideoStream onStreamStart={handleVideoStart} />
            </CardContent>
          </Card>
        </div>
      </div>
    </QueryClientProvider>
  );
}
