// "use client";

// import Link from "next/link";
// import React, { useEffect } from "react";
// import Logo from "./dashboard/Header/logo";
// import { Button } from "./ui/button";
// import { usePathname } from "next/navigation";
// import { datadogRum } from "@datadog/browser-rum";
// import { useUser } from "@/src/contexts/UserContext";
// import { LogOut } from "lucide-react";

// function Header() {
//   const pathname = usePathname();
//   const isHomePage = pathname === "/";
//   const { user, logout, role } = useUser();

//   useEffect(() => {
//     // log only to prod
//     if (window.location.href.startsWith("https://theavatarx.com")) {
//       datadogRum.init({
//         applicationId: "ed5e4bb6-58d3-4528-8057-bd3fc6388530",
//         clientToken: "pubb81d9fa8c7da517899d3301893962664",
//         // `site` refers to the Datadog site parameter of your organization
//         // see https://docs.datadoghq.com/getting_started/site/
//         site: "us5.datadoghq.com",
//         service: "theavatarx.com",
//         env: "theavatarx.com",
//         // Specify a version number to identify the deployed version of your application in Datadog
//         // version: '1.0.0',
//         sessionSampleRate: 100,
//         sessionReplaySampleRate: 20,
//         trackUserInteractions: true,
//         trackResources: true,
//         trackLongTasks: true,
//         defaultPrivacyLevel: "mask-user-input",
//       });

//       datadogRum.startSessionReplayRecording();
//     }
//   }, []);

//   return (
//     <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//       {/* Navigation */}
//       <div className="container flex h-16 items-center justify-between">
//         <Link href="/" className="flex items-center space-x-2">
//           <Logo />
//         </Link>
//         <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
//           <Link
//             href={isHomePage ? "#key-benefits" : "/#key-benefits"}
//             className="transition-colors hover:text-foreground/80"
//           >
//             Key Benefits
//           </Link>
//           <Link
//             href={isHomePage ? "#cost-savings" : "/#cost-savings"}
//             className="transition-colors hover:text-foreground/80"
//           >
//             Cost Savings
//           </Link>
//           <Link
//             href={
//               isHomePage
//                 ? "#competitive-advantages"
//                 : "/#competitive-advantages"
//             }
//             className="transition-colors hover:text-foreground/80"
//           >
//             Advantages
//           </Link>
//           <Link
//             href={
//               isHomePage
//                 ? "#scalability-compliance"
//                 : "/#scalability-compliance"
//             }
//             className="transition-colors hover:text-foreground/80"
//           >
//             Compliance
//           </Link>
//           <Link
//             href={isHomePage ? "#contact" : "/#contact"}
//             className="transition-colors hover:text-foreground/80"
//           >
//             Contact Us
//           </Link>
//           {/* <Link
//             href="#pricing"
//             className="transition-colors hover:text-foreground/80"
//           >
//             Pricing
//           </Link> */}
//         </nav>
//         <div className="flex items-center space-x-4">
//           {/* <Button variant="link" className="hidden md:inline-flex">
//             Sign In
//           </Button> */}
//           {role != "user" && pathname == "/" && (
//             <Link href="https://calendly.com/phanig/30-minute">
//               <Button variant="default" className="hidden md:inline-flex">
//                 Book a Demo
//               </Button>
//             </Link>
//           )}

//           {!user && !role && (
//             <Link href="/login">
//               <Button variant="outline">Try our platform</Button>
//             </Link>
//           )}

//           {role == "admin" && user && (pathname == "/" || pathname == '/demos/medical-checkin') && (
//             <Link href="/admin/dashboard">
//               <Button variant="outline">Go to Dashboard</Button>
//             </Link>
//           )}
//           {role == "user" && user && pathname == "/" && (
//             <Link href="/avatars">
//               <Button variant="outline">Go to Avatars</Button>
//             </Link>
//           )}
//           {user && role == "user" && (
//             <Link href="/login" onClick={() => logout()}>
//               <Button variant="default">
//                 <LogOut className="mr-2 h-4 w-4" color="white" />
//                 Log out
//               </Button>
//             </Link>
//           )}
//           {/* <Link href="/signup">
//             <Button>Get Started</Button>
//           </Link> */}
//         </div>
//       </div>
//     </header>
//   );
// }

// export default Header;

"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Logo from "./dashboard/Header/logo";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { datadogRum } from "@datadog/browser-rum";
import { useUser } from "@/src/contexts/UserContext";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import "../styles/Navbar.css";

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
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [blurred, setBlurred] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isClicked, setIsClicked] = useState(false);
  // const router = useRouter();
  const toggleButton = () => {
    setIsClicked((prev) => !prev);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleScroll = () => {
        const offset = window.scrollY;

        if (offset > 50) {
          setScrolled(true);
        } else {
          setScrolled(false);
        }

        if (offset < lastScrollTop) {
          setBlurred(true);
        } else {
          setBlurred(false);
        }

        setLastScrollTop(offset);
      };

      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [lastScrollTop]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Navigation */}
      <nav
        className={`navbar ${scrolled ? "scrolled" : ""} ${
          blurred ? "blurred" : ""
        }`}
      >
        <div className="logo" onClick={() => router.push("/")}>
          <Logo />
        </div>
        <div>
          <button onClick={toggleButton} className="toggle-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 41 10"
              className="w-39 m-auto"
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              >
                <path d="M1 1h39M9 9h31"></path>
              </g>
            </svg>
          </button>
        </div>
        <ul className="nav-links mobile-hide">
          <li>
            <a href="/#what-we-do">WHAT WE DO</a>
          </li>
          <li>
            <a href="/#technology">OUR AI TECHNOLOGY</a>
          </li>
          {/* <li>
            <a href="#story">OUR STORY</a>
          </li> */}
          <li>
            <button
              className="contact-button"
              onClick={() => router.push("/contact")}
            >
              CONTACT US
            </button>
          </li>
          <li>
            <button
              className="contact-button"
              onClick={() =>
                router.push(
                  "https://calendly.com/phanig/30-minute?month=2025-02"
                )
              }
            >
              BOOK A DEMO
            </button>
          </li>
          <li>
            <a
              style={{ cursor: "pointer" }}
              onClick={() => 
                router.push(
                  "https://theavatarx.com/login"
                )
              }
            >
              LOG IN
            </a>
          </li>
        </ul>
      </nav>
      <ul
        className={
          isClicked
            ? "nav-links mobile-menu toggle-active"
            : "nav-links mobile-menu"
        }
      >
        <button onClick={toggleButton} className="close-btn">
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 256 256"
            className="w-30 md:w-35 m-auto"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
          </svg>
        </button>
        <li>
          <a href="#what-we-do">WHAT WE DO</a>
        </li>
        <li>
          <a href="#technology">OUR AI TECHNOLOGY</a>
        </li>
        <li>
          <a href="#story">OUR STORY</a>
        </li>
        <li>
          <button className="contact-button">CONTACT US</button>
        </li>
        <li>
          <button className="demo-button">BOOK A DEMO</button>
        </li>
        <li>
          <a href="#login">LOG IN</a>
        </li>
      </ul>
    </header>
  );
}

export default Header;

