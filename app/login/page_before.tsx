"use client";

import { Button, Box, Typography, Paper } from "@mui/material";
import { useGoogleLogin } from "@react-oauth/google";
import { googleLogin } from "@/src/api/api";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { LoggedInUserContext } from "@/src/contexts/LoggedInUserContext";

export default function LoginPage() {
  const router = useRouter();
  const { loggedInUser, setLoggedInUser } = useContext(LoggedInUserContext);

  const login = useGoogleLogin({
    onSuccess: async (codeResponse: { access_token: string }) => {
      try {
        const res = await googleLogin({
          token: codeResponse.access_token,
        });
        console.log("Logging in with response:", res.data);
        if (res.status === 200) {
          localStorage.setItem("token", res.data.user.token);
          if (res.data.user.role == "user") router.push("/avatars");
          else if (res.data.user.role == "admin")
            router.push("/admin/dashboard");

          setLoggedInUser(res.data.user);

          console.log("pushed to avatars: ", codeResponse.access_token);
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

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 w-full">
      <Paper
        elevation={3}
        className="p-6 rounded-lg shadow-md w-80 text-center bg-white"
      >
        <Typography variant="h5" className="mb-6 font-semibold text-gray-800">
          Sign in
        </Typography>
        <Typography variant="body2" className="mb-6 text-gray-600">
          Sign in to continue to AvatarX
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
              alt="Google"
              width={20}
              height={20}
              className="h-5 w-5"
            />
          }
          onClick={(e) => {
            e.preventDefault();
            login();
          }}
          className="normal-case w-full py-2"
        >
          Sign in with Google
        </Button>
      </Paper>
    </div>
  );
}
