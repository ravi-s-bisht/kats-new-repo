"use client";

import App from "@/components/App";
import { DailyTransport } from "@daily-co/realtime-ai-daily";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useEffect, useRef, useState } from "react";
import { LLMHelper, RTVIClient } from "realtime-ai";
import { RTVIClientAudio, RTVIClientProvider } from "realtime-ai-react";
import Homepage from "@/components/Homepage";

import { AppProvider } from "@/components/context";
import Splash from "@/components/Splash";
import {
  BOT_READY_TIMEOUT,
  defaultConfig,
  defaultServices,
} from "@/rtvi.config";

function Page({ params }: { params: Promise<{ slug: string }> }): JSX.Element {
  const [showSplash, setShowSplash] = useState(false);
  const voiceClientRef = useRef<RTVIClient | null>(null);
  const [botId, setBotId] = useState<number | null>(null);

  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params;
      setBotId(Number(resolvedParams.slug));
    };
    fetchParams();
  }, [params]);

  useEffect(() => {
    // if (!showSplash) {
    //   return;
    // }

    const voiceClient = new RTVIClient({
      transport: new DailyTransport(),
      params: {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "/api",
        requestData: {
          services: defaultServices,
          config: defaultConfig,
        },
      },
      timeout: BOT_READY_TIMEOUT,
      callbacks: {
        onUserTranscript(data) {
          console.log("user: ", data);
        },
        onBotTranscript(data) {
          console.log("bot response: ", data);
        },
      },
    });

    const llmHelper = new LLMHelper({});
    voiceClient.registerHelper("llm", llmHelper);

    voiceClientRef.current = voiceClient;
  }, [showSplash]);

  if (showSplash) {
    return <Splash handleReady={() => setShowSplash(false)} botId={botId} params={params} />;
  }
  
  return (
    <div className="flex flex-col justify-center items-center">
      <RTVIClientProvider client={voiceClientRef.current!}>
        <AppProvider>
          <TooltipProvider>
            <TooltipProvider>
              <App setShowSplash={() => {}} botId={botId} />
            </TooltipProvider>
          </TooltipProvider>
        </AppProvider>
        <RTVIClientAudio />
      </RTVIClientProvider>
    </div>
  );
}

export default Page;
