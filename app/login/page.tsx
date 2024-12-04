"use client";

import { useContext, useState } from "react";
import { Button } from "@/components/ui/button_old";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useGoogleLogin } from "@react-oauth/google";
import { googleLogin } from "@/src/api/api";
import { LoggedInUserContext } from "@/src/contexts/LoggedInUserContext";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { loggedInUser, setLoggedInUser } = useContext(LoggedInUserContext);
  const { toast } = useToast();

  const login = useGoogleLogin({
    onSuccess: async (codeResponse: { access_token: string }) => {
      try {
        console.log('codeResponse', codeResponse);
        const res = await googleLogin({
          token: codeResponse.access_token,
        });

        console.log('codeResponse with ressssss', codeResponse, res);

        if (res.status === 200) {
          localStorage.setItem("token", res.data.user.token);
          if (res.data.user.role == "user") router.push("/voice-avatars");
          else if (res.data.user.role == "facility")
            router.push("/admin/dashboard/users");

          setLoggedInUser(res.data.user);

          console.log("pushed to avatars: ", codeResponse.access_token, res.data);
        } else {
          console.error("Error logging in:", res);
        }
      } catch (e) {
        console.error("Error during login:", e);
        // show user notification
      }
    },
    onError: (error) => {
      console.log("Login Failed:", error);
      // Optionally, show user notification for login failure
    },
  });

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    login();
    // Simulate Google Sign-In process
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Sign-in successful",
        description: "You have been signed in with Google.",
      });
      // Here you would typically redirect to the dashboard or home page
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background w-full">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold">Welcome to AvatarX</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access your account
          </p>
        </div>
        <Button
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
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
