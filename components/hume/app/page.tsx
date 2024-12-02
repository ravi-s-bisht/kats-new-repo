import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Chat = dynamic(() => import("@/components/hume/components/Chat"), {
  ssr: false,
});

export default async function Page() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

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
  }, []);

  if (!accessToken) {
    throw new Error();
  }

  return (
    <div className={"grow flex flex-col"}>
      <Chat accessToken={accessToken} />
    </div>
  );
}
