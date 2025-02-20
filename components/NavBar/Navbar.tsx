"use client";
import React, { useEffect, useState } from "react";
import "./Navbar.css";
import Image from "next/image";
import LogoImg from "../../public/images/logo.webp";
import { datadogRum } from "@datadog/browser-rum";
import { useRouter, usePathname } from "next/navigation";

function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [blurred, setBlurred] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [isClicked, setIsClicked] = useState(false);
  const toggleButton = () => {
    setIsClicked((prev) => !prev);
  };
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
    <>
      <nav
        className={`navbar ${scrolled ? "scrolled" : ""} ${
          blurred ? "blurred" : ""
        }`}
      >
        <div className="logo" onClick={() => router.push("/")}>
          <Image src={LogoImg} alt="AvatarX Health" />
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
                  // "https://theavatarx.com/login"
                  "/login"
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
          <a href="/login">LOG IN</a>
        </li>
      </ul>
    </>
  );
}

export default Navbar;
