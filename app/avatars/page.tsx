"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { checkToken as apiCheckToken } from "@/src/api/api"; // Import the checkToken function from the API

function Avatars() {
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await apiCheckToken(); // Call the API checkToken function

        console.log("check up on token", response);

        if (response.status !== 200) {
          // Corrected comparison to check if status is not 200
          router.push("/login"); // Redirect to /login if not authenticated
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        router.push("/login"); // Redirect to /login on error
      }
    };

    checkToken();
  }, [router]);

  return (
    <div>
      <div>
        This is a list of avatars to talk to with different personalities.
      </div>
    </div>
  );
}

export default Avatars;
