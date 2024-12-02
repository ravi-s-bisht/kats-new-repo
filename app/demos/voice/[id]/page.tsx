"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { VoiceProvider, useVoice } from "@humeai/voice-react";
import { HUME_PRESET_CHARACTERS } from "@/components/hume/hume-configs";

const Chat = dynamic(() => import("@/components/hume/components/Chat"), {
  ssr: false,
});

export default function VoiceCallPage() {
  const { id } = useParams();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const timeout = useRef<number | null>(null);
  const [avatar, setAvatar] = useState<any>(null);

  const fetchToken = async () => {
    try {
      const response = await fetch("/api/hume", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch access token");
      }

      const data = await response.json();

      setAccessToken(data.accessToken);
    } catch (error) {
      console.error("Error fetching access token:", error);
    }
  };

  useEffect(() => {
    fetchToken();
    const avatar = HUME_PRESET_CHARACTERS.find(
      (character) => character.id === Number(id)
    );

    setAvatar(avatar);
  }, [id]);

  if (!accessToken) {
    return (
      <div className={"grow flex flex-col justify-center items-center"}>
        Loading...
      </div>
    );
  }

  return (
    <VoiceProvider
      auth={{ type: "accessToken", value: accessToken }}
      configId={avatar?.hume_config_id}
      onMessage={() => {
        if (timeout.current) {
          window.clearTimeout(timeout.current);
        }
      }}
    >
      <div className={"grow flex flex-col"}>
        <Chat accessToken={accessToken} id={Number(id)} />{" "}
      </div>
    </VoiceProvider>
  );
}