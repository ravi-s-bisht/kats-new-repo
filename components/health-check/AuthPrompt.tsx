import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalysis } from "@/lib/context";
import { Lock } from "lucide-react";

interface AuthPromptProps {
  onAuthSuccess?: () => void;
}

export default function AuthPrompt({ onAuthSuccess }: AuthPromptProps) {
  const { setIsAuthenticated } = useAnalysis();

  const handleLogin = () => {
    setIsAuthenticated(true);
    onAuthSuccess?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">View Your Analysis</CardTitle>
          <CardDescription>
            Sign in or create an account to view your complete health analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full"
            onClick={handleLogin}
          >
            Sign in / Create Account
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            For demo purposes, clicking the button will automatically authenticate you
          </p>
        </CardContent>
      </Card>
    </div>
  );
}