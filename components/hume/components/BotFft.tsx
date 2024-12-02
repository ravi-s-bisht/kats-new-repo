import React from "react";
import MicFFT from "./MicFFT";
import { useVoice } from "@humeai/voice-react";

function BotFft() {
  const { fft, status } = useVoice();

  return (
    status.value === "connected" ? (
      <div className="flex flex-col justify-center items-center h-[400px] w-[400px] mb-32 border-8 rounded-lg border-primary-300 outline-6 outline-primary-300 outline-offset-0">
        <MicFFT fft={fft} className={"fill-current"} />
      </div>
    ) : null
  );
}

export default BotFft;