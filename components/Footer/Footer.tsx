"use client";
import React from "react";
import { useRouter } from "next/navigation";
import "./Footer.css"; // Make sure to create a CSS file for styling

function Footer() {
  const router = useRouter();
  return (
    <footer className="footer_1">
      <div className="footer-content">
        <div className="footer-link-container">
          <div className="footer-section">
            <h4>AvatarX Health</h4>
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li
                style={{ cursor: "pointer" }}
              >
                <a href="/#what-we-do">What We Do</a>
              </li>
              <li
                style={{ cursor: "pointer" }}
              >
                <a href="/#technology">Our AI Technology</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-btn-container">
          <button
            className="contact-us-btn"
            onClick={() => router.push("/contact")}
          >
            Contact Us
          </button>
          <button
            className="contact-us-btn"
            onClick={() =>
              router.push("https://calendly.com/phanig/30-minute?month=2025-02")
            }
          >
            Book a Demo
          </button>
          <button
            className="login-btn"
            onClick={() => 
              router.push(
                "/login"
              )
            }
          >
            Login
          </button>
        </div>
      </div>
      <div className="footer-bottom">
        {/* <div className="social-icons">
          <a href="#">
            <FontAwesomeIcon icon={faLinkedin} />
          </a>
          <a href="#">
            <FontAwesomeIcon icon={faFacebook} />
          </a>
          <a href="#">
            <FontAwesomeIcon icon={faTwitter} />
          </a>
          <a href="#">
            <FontAwesomeIcon icon={faInstagram} />
          </a>
        </div> */}
        <p>Copyright © 2024 - AvatarX Health. All Rights Reserved</p>
      </div>
    </footer>
  );
}

export default Footer;
