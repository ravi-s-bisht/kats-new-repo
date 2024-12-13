"use client";

import Link from "next/link";
import React, { useEffect } from "react";
import Logo from "./dashboard/Header/logo";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { datadogRum } from "@datadog/browser-rum";
import { useUser } from "@/src/contexts/UserContext";

function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { user, logout, role } = useUser();

  useEffect(() => {
    // log only to prod
    if (window.location.href.startsWith("https://theavatarx.com")) {
      datadogRum.init({
        applicationId: "ed5e4bb6-58d3-4528-8057-bd3fc6388530",
        clientToken: "pubb81d9fa8c7da517899d3301893962664",
        // `site` refers to the Datadog site parameter of your organization
        // see https://docs.datadoghq.com/getting_started/site/
        site: "us5.datadoghq.com",
        service: "theavatarx.com",
        env: "theavatarx.com",
        // Specify a version number to identify the deployed version of your application in Datadog
        // version: '1.0.0',
        sessionSampleRate: 100,
        sessionReplaySampleRate: 20,
        trackUserInteractions: true,
        trackResources: true,
        trackLongTasks: true,
        defaultPrivacyLevel: "mask-user-input",
      });

      datadogRum.startSessionReplayRecording();
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Navigation */}
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href={isHomePage ? "#key-benefits" : "/#key-benefits"}
            className="transition-colors hover:text-foreground/80"
          >
            Key Benefits
          </Link>
          <Link
            href={isHomePage ? "#cost-savings" : "/#cost-savings"}
            className="transition-colors hover:text-foreground/80"
          >
            Cost Savings
          </Link>
          <Link
            href={
              isHomePage
                ? "#competitive-advantages"
                : "/#competitive-advantages"
            }
            className="transition-colors hover:text-foreground/80"
          >
            Advantages
          </Link>
          <Link
            href={
              isHomePage
                ? "#scalability-compliance"
                : "/#scalability-compliance"
            }
            className="transition-colors hover:text-foreground/80"
          >
            Compliance
          </Link>
          <Link
            href={isHomePage ? "#contact" : "/#contact"}
            className="transition-colors hover:text-foreground/80"
          >
            Contact Us
          </Link>
          {/* <Link
            href="#pricing"
            className="transition-colors hover:text-foreground/80"
          >
            Pricing
          </Link> */}
        </nav>
        <div className="flex items-center space-x-4">
          {/* <Button variant="link" className="hidden md:inline-flex">
            Sign In
          </Button> */}
          {role != 'user' && <Link href="https://calendly.com/phanig/30-minute">
            <Button variant="default" className="hidden md:inline-flex">
              Book a Demo
            </Button>
          </Link>}

          {role == "admin" && user && pathname == "/" && (
            <Link href="/admin/dashboard/users">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          )}
          {role == "user" && user && pathname == "/" && (
            <Link href="/avatars">
              <Button variant="outline">Go to Avatars</Button>
            </Link>
          )}
          {user && role == "user" && (
            <Link href="/login" onClick={() => logout()}>
              <Button variant="destructive" className="bg-red-500 text-white">
                Log out
              </Button>
            </Link>
          )}
          {/* <Link href="/signup">
            <Button>Get Started</Button>
          </Link> */}
        </div>
      </div>
    </header>
  );
}

export default Header;
