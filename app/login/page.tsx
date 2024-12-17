"use client";

import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button_old";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useGoogleLogin } from "@react-oauth/google";
import { googleLogin } from "@/src/api/api";
import { LoggedInUserContext } from "@/src/contexts/LoggedInUserContext";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

export default function SignInPage() {
  const router = useRouter();
  const { setUser, role, setRole, logout } = useUser();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("token", data.token);
          setUser(data.user);
          setRole(data.role);
          setIsLoading(false);

          router.push(data.role === "admin" ? "/admin/dashboard" : "/avatars");
        } else {
          const errorData = await res.json();
          setLoginError(errorData.error || "Login failed");
          toast({
            title: "Login failed",
            description: errorData.error || "Login failed.",
          });
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Login error:", error);
        setLoginError("An unexpected error occurred");
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google Login Failed:", error);
      setLoginError("Google login failed. Please try again.");
    },
  });

  useEffect(() => {
    const rol = localStorage.getItem("token");

    if (rol) {
      router.push(rol == "admin" ? "/admin/dashboard" : "/avatars");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background w-full">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-xl shadow-lg mb-16">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold">Welcome to AvatarX</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access your account
          </p>
        </div>
        <Button className="w-full" onClick={() => login()} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
              alt="Google"
              width={20}
              height={20}
              className="h-5 w-5 mr-2"
            />
          )}
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
