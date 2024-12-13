"use client";

import { useVoice, VoiceProvider } from "@humeai/voice-react";
import Controls from "./Controls";
import StartCall from "./StartCall";
import { ComponentRef, useEffect, useRef, useState } from "react";
import BotFft from "./BotFft";
import { HUME_PRESET_CHARACTERS } from "../hume-configs";
import { addSessionLog } from "@/src/api/api";
import { useUser } from "@/src/contexts/UserContext";

export default function ClientComponent({
  accessToken,
  id,
}: {
  accessToken: string;
  id: number;
}) {
  const { connect, status } = useVoice();
  const firstTime = useRef(true);
  const [first, setFirst] = useState(true);
  const { user } = useUser();

  const addSession = async () => {
    await addSessionLog({
      type: "voice",
      user_id: user?.id,
      avatar_id: 1,
    });
  };

  useEffect(() => {
    if (accessToken && firstTime.current && status.value != "connected") {
      firstTime.current = false;
      setFirst(false);
      connect();

      // Add Session to database log
      addSession();

      return;
    }
  }, [accessToken, connect, status]);

  return (
    <div
      className={
        "relative grow flex flex-col mx-auto w-full overflow-hidden h-[0px] justify-center items-center"
      }
    >
      <BotFft />
      <Controls />
      <StartCall />
    </div>
  );
}
