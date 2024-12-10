import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./global.css";
import Header from "@/components/Header";
import { LoggedInUserContextProvider } from "@/src/contexts/LoggedInUserContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { UserProvider } from "@/src/contexts/UserContext";
import { Toaster } from "@/components/ui/toaster";
// import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AvatarX",
  description: "AvatarX senior companion platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className + " " + `flex flex-col bg-white`}>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_LOGIN_API_KEY || ""}
        >
          <UserProvider>
            <Header />
            {children}
            <Toaster />
          </UserProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
