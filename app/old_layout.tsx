import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./global.css";
import { LoggedInUserContextProvider } from "@/src/contexts/LoggedInUserContext";

// Font
const fontSans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const fontMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "AvatarX Demo",
  description: "AvatarX Demo",
  metadataBase: new URL("https://avatarx.live"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} ${fontMono.variable}`}>
        <LoggedInUserContextProvider>
          <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_LOGIN_API_KEY || ""}
          >
            {children}
          </GoogleOAuthProvider>
        </LoggedInUserContextProvider>
      </body>
    </html>
  );
}
