import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/src/contexts/UserContext";
import { useAnalysis } from "@/src/lib/context";
import { useGoogleLogin } from "@react-oauth/google";
import { Loader2, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthPromptProps {
  onAuthSuccess?: () => void;
}

export default function AuthPrompt({ onAuthSuccess }: AuthPromptProps) {
  const { setIsLoggedIn, analysisData } = useAnalysis();
  const { user } = useUser();

  const handleLogin = () => {
    setIsLoggedIn(true);
    onAuthSuccess?.();
  };

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
          
          handleLogin();

          // router.push('/medical-checkin');
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
    if (user) {
      handleLogin();
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">View Your Analysis</CardTitle>
          <CardDescription>
            Sign in to view your complete health analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        <Link href="/api/auth/microsoft">
          <Button
            className="w-full mt-4"
            onClick={() => {
              console.log("Microsoft login clicked")
              localStorage.setItem('analysisData', JSON.stringify(analysisData));
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                alt="Microsoft"
                width={20}
                height={20}
                className="h-5 w-5 mr-2"
              />
            )}
            Sign in with Microsoft
          </Button>
        </Link>
        </CardContent>
      </Card>
    </div>
  );
}