"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleChange = (e:any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");

    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setFeedback("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      setFeedback("Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setFeedback("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      className="flex flex-col space-y-4 w-full max-w-lg"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      onSubmit={handleSubmit}
    >
      <Input
        name="name"
        placeholder="Your Name"
        value={formData.name}
        onChange={handleChange}
      />
      <Input
        name="email"
        type="email"
        placeholder="Your Email"
        value={formData.email}
        onChange={handleChange}
      />
      <Input
        name="subject"
        placeholder="Subject"
        value={formData.subject}
        onChange={handleChange}
      />
      <Textarea
        name="message"
        placeholder="Your Message"
        value={formData.message}
        onChange={handleChange}
      />
      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Sending..." : "Send Message"}
      </Button>
      {feedback && <p className="text-center text-sm mt-2">{feedback}</p>}
    </motion.form>
  );
}