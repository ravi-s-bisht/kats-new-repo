"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/contexts/UserContext";
import { Loader, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MicrosoftCallbackHandler() {
  const router = useRouter();
  const { setUser, setRole, logout } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    const processToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (token) {
        try {
          // Verify the token
          const response = await fetch("/api/auth/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            const { role, user, token } = await response.json();
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            setUser(user);
            setRole(role);

            const analysisData = localStorage.getItem('analysisData')
            if(analysisData)
              router.push('/demos/medical-checkin')
            else
              router.push(role == "admin" ? "/admin/dashboard" : "/avatars");
          } else {
            const { error } = await response.json();
            throw new Error(error || "Failed to verify token.");
          }
        } catch (error: any) {
          console.error("Error verifying token:", error);
          toast({
            title: "Authentication Error",
            description: error.message || "An unexpected error occurred.",
          });
          logout();
        }
      } else {
        console.log("Toekn not found");
        const error = urlParams.get("error");
        toast({
          title: "Authentication Error",
          description: error || "An unexpected error occurred.",
        });
        console.log("after toast");
        logout();
      }
    };

    processToken();
  }, [router, setUser, setRole, logout, toast]);

  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="animate-spin" size={48} />
      <p className="ml-4 text-lg">Processing your login...</p>
    </div>
  );
}
