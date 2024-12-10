"use client";

import React, { useEffect, useRef, useState } from "react";
import { DailyProvider } from "@daily-co/daily-react";
import { CallScreen } from "@/components/tavus/src/components/CallScreen";
import { endConversation } from "@/components/tavus/src/api";
import { useParams, useRouter } from "next/navigation";
import {
  HUME_PRESET_CHARACTERS,
  VideoHumePresetCharacter,
} from "@/components/hume/hume-configs";

function VideoCallPage() {
  const { id } = useParams();
  const [tavusConversation, setTavusConversation] = useState<any>(null);
  const router = useRouter();
  const [time, setTime] = useState(0);
  const timerRef = useRef<any>(null);
  const [avatar, setAvatar] = useState<any>(null);
  const firstTime = useRef(true);

  useEffect(() => {
    const avatar = HUME_PRESET_CHARACTERS.find(
      (character) => character.id === Number(id)
    );

    setAvatar(avatar);
  }, [id]);

  const callVideo = async () => {
    const avatar = HUME_PRESET_CHARACTERS.find(
      (character): character is VideoHumePresetCharacter => character.id === Number(id)
    );

    if (!avatar) {
      throw new Error("Avatar not found or is not a video type");
    }

    try {
      const data = await fetch("https://tavusapi.com/v2/conversations", {
        method: "POST",
        body: JSON.stringify({
          persona_id: avatar?.persona_id,
          replica_id: avatar?.replica_id,
          conversation_name: `Conversation with ${avatar?.name}`,
          conversational_context: avatar?.prompt,
          properties: {
            max_call_duration: 240000,
            participant_left_timeout: 0,
          },
        }),
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_TAVUS_KEY || "",
          "Content-Type": "application/json",
        },
      });

      const response = await data.json();
      console.log("response video", response);
      setTavusConversation(response);

      return response;
    } catch (error) {
      console.error("Error during video call:", error);
      // Handle error appropriately, e.g., show a message to the user
    }
  };

  const handleTavusVideoEnd = async () => {
    await endConversation(tavusConversation?.conversation_id);
    router.push("/avatars");
  };

  function startTimer() {
    timerRef.current = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }

  useEffect(() => {
    console.log("first time videooooooooo3324");
    if (firstTime.current) {
      firstTime.current = false;
      callVideo();
    }
  }, []);

  if (!tavusConversation) {
    return (
      <div className={"grow flex flex-col justify-center items-center"}>
        Loading...
      </div>
    );
  }

  return (
    <DailyProvider>
      {avatar && (
        <CallScreen
          conversation={tavusConversation}
          handleEnd={handleTavusVideoEnd}
          timer={time}
          startTimer={startTimer}
        />
      )}
    </DailyProvider>
  );
}

export default VideoCallPage;
