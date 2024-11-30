import Link from "next/link";
import React from "react";
import Logo from "./dashboard/Header/logo";
import { Button } from "./ui/button";

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Navigation */}
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="#key-benefits"
            className="transition-colors hover:text-foreground/80"
          >
            Key Benefits
          </Link>
          <Link
            href="#cost-savings"
            className="transition-colors hover:text-foreground/80"
          >
            Cost Savings
          </Link>
          <Link
            href="#competitive-advantages"
            className="transition-colors hover:text-foreground/80"
          >
            Advantages
          </Link>
          <Link
            href="#scalability-compliance"
            className="transition-colors hover:text-foreground/80"
          >
            Compliance
          </Link>
          <Link
            href="#contact"
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
          {/* <Link href="/signup">
            <Button>Get Started</Button>
          </Link> */}
        </div>
      </div>
    </header>
  );
}

export default Header;