"use client";

import Link from "next/link";
import React from "react";
import Logo from "./dashboard/Header/logo";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { useUser } from "@/src/contexts/UserContext";

function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { user, logout, role } = useUser();

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
        </div>
      </div>
    </header>
  );
}

export default Header;
