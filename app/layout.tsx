import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./global.css";
// import Header from "@/components/Header";
// import { LoggedInUserContextProvider } from "@/src/contexts/LoggedInUserContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { UserProvider } from "@/src/contexts/UserContext";
import { Toaster } from "@/components/ui/toaster";
import { AnalysisProvider } from "@/src/lib/context";
import Head from "next/head";
import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/NavBar/Navbar";
import AOSInitializer from "@/components/AOSInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AvatarX",
  description: "Unlock next-level patient care with AvatarX Health an AI-powered platform designed to enhance outcomes, reduce readmissions, and cut costs through intelligent monitoring and proactive care solutions. Experience the power of precision-driven healthcare for a healthier tomorrow.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body className={inter.className + " " + `flex flex-col bg-white`}>
        <AOSInitializer />
        <GoogleOAuthProvider clientId={process.env.GOOGLE_LOGIN_API_KEY || ""}>
          <UserProvider>
            <AnalysisProvider>
              <Navbar />
              {children}
              <Footer />
            </AnalysisProvider>
            <Toaster />
          </UserProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
