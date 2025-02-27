"use client";

import React, { useState } from "react";
import Image from "next/image";
import ContactImg from "../../public/images/side-view-banner.jpg";
import ContactGridImage from "../../public/images/doctor.jpg";
import ContactGridPattern from "../../public/contact-pattern.svg";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define form data types
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>();

  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    try {
      setLoading(true);
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      toast.success("Message sent successfully!");
      reset();
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="inner-hero-section">
        <div className="hero-gradient"></div>
        <div className="position-relative">
          <Image src={ContactImg} className="hero-banner" alt="AvatarX Health" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 857 186"
            className="hero-pattern"
          >
            <path
              fill="#fff"
              d="M777 54c24.5 0 40 17.906 40 40v52c0 22.094 17.906 40 40 40H0V0v14c0 22.094 17.906 40 40 40z"
            ></path>
          </svg>
        </div>
        <div className="inner-hero-content">
          <h4 className="eyebrow-heading text-left">Get in touch</h4>
          <h2 className="heading text-left">Contact Us</h2>
        </div>
      </section>
      <section className="contact-form">
        <div className="inner-container">
          <h2 className="contact-heading" data-aos="fade-up" 
                data-aos-duration="500">
            Take your first step to{" "}
            <span className="highlight-text">transforming care delivery</span>{" "}
            for your organization here!
          </h2>
          <div className="contact-grid">
            <div className="contact-imgbx">
              <Image
                src={ContactGridImage}
                className="contact-grid-image"
                alt="AvatarX Health"
                height={800}
                data-aos="fade-right"
                data-aos-duration="500"
              />
              <Image
                src={ContactGridPattern}
                className="contact-grid-pattern"
                data-aos="fade-down"
                data-aos-duration="500"
                alt="AvatarX Health"
              />
            </div>
            <div className="contact-form-wrapper" data-aos="fade-left" 
                data-aos-duration="500">
              <h2 className="form-heading">Share Your Details</h2>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-wrapper">
                  <input
                    type="text"
                    className="contact-field"
                    placeholder="Your Name"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && <p className="form-error">{errors.name.message}</p>}
                </div>
                <div className="form-wrapper">
                  <input
                    type="email"
                    className="contact-field"
                    placeholder="Email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: "Please enter a valid email address",
                      },
                    })}
                  />
                  {errors.email && <p className="form-error">{errors.email.message}</p>}
                </div>
                <div className="form-wrapper">
                  <input
                    type="text"
                    className="contact-field"
                    placeholder="Subject"
                    {...register("subject", { required: "Subject is required" })}
                  />
                  {errors.subject && <p className="form-error">{errors.subject.message}</p>}
                </div>
                <div className="form-wrapper">
                  <textarea
                    rows={4}
                    className="contact-field"
                    placeholder="Message"
                    {...register("message", { required: "Message is required" })}
                  ></textarea>
                  {errors.message && <p className="form-error">{errors.message.message}</p>}
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
    </div>
  );
}
    