"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Clock,
  Contact,
  GamepadIcon,
  HeartIcon,
  LightbulbIcon,
  MessageSquare,
  Phone,
  Shield,
  TrendingUpIcon,
  CheckCircle,
  BarChart,
  Users,
} from "lucide-react";
import Image from "next/image";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import Logo from "@/components/Header/logo";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ContactPage from "@/components/Contact";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function Homepage() {
  return (
    <div className="flex min-h-screen flex-col w-full">
      {/* Hero Section */}
      <section className="relative">
        <div className="container flex flex-col items-center justify-center space-y-8 pt-24 pb-16 text-center md:pt-32">
          <motion.div
            className="mx-auto max-w-3xl space-y-4"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              AI Companions: Revolutionizing Senior Care Facilities
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Transforming the landscape of senior care with innovative
              solutions to enhance resident engagement, improve operational
              efficiency, and boost family satisfaction.
            </p>
          </motion.div>
          <motion.div
            className="flex flex-col gap-4 min-[400px]:flex-row z-11"
            style={{ zIndex: 10 }}
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
          >
            {/* <motion.div variants={fadeIn}>
              <Button size="lg" className="shadow-lg">
                Start Free Trial
              </Button>
            </motion.div> */}
            <motion.div variants={fadeIn} className="space-x-7">
              <Link href="#contact">
                <Button size="lg" variant="outline" className="shadow-sm cursor-pointer">
                  Contact Us
                </Button>
              </Link>
              <Link href="/demos">
                <Button size="lg" className="shadow-sm cursor-pointer">
                  Try Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute z-0 inset-0 bg-[linear-gradient(to_right,rgba(200,200,200,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(200,200,200,0.5)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(176,186,201,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(176,186,201,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </section>

      {/* <motion.div
        className="relative mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-xl border bg-muted shadow-2xl mt-8 md:mt-12"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <Image
          src="/placeholder.svg"
          alt="AI Companion interacting with seniors"
          className="object-cover"
          fill
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Button size="lg" className="pointer-events-none">
            Watch Demo
          </Button>
        </div>
      </motion.div> */}

      {/* Key Benefits Section - Timeline Style */}
      <section
        id="key-benefits"
        className="container py-1 sm:py-3 bg-white w-full"
      >
        <motion.div
          className="mx-auto max-w-2xl text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Key Benefits
          </h2>
        </motion.div>
        <motion.div
          className="relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          <div className="absolute left-1/2 h-full w-0.5 bg-gray-200"></div>
          {[
            {
              icon: Users,
              title: "Enhanced Resident Engagement",
              items: [
                "24/7 companionship reduces loneliness",
                "Personalized activities stimulate mental well-being",
                "Cognitive exercises support brain health",
              ],
            },
            {
              icon: BarChart,
              title: "Operational Efficiency",
              items: [
                "Automated reminders optimize staff workload",
                "AI-led group activities reduce resource dependency",
                "Real-time monitoring ensures resident safety",
              ],
            },
            {
              icon: HeartIcon,
              title: "Family Satisfaction",
              items: [
                "Connected care keeps families informed",
                "Instant updates on resident well-being",
                "Continuous monitoring provides peace of mind",
              ],
            },
          ].map((benefit, index) => (
            <motion.div
              key={index}
              className={`flex ${
                index % 2 === 0 ? "flex-row-reverse" : ""
              } items-center mb-8`}
              variants={fadeIn}
            >
              <div className={`w-1/2 ${index % 2 === 0 ? "pl-8" : "pr-8"}`}>
                <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <benefit.icon className="h-12 w-12 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <ul className="text-muted-foreground list-disc pl-5 text-gray-400 text-left">
                    {benefit.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </Card>
              </div>
              <div className="w-8 h-8 bg-primary rounded-full border-4 border-white absolute left-1/2 transform -translate-x-1/2"></div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Cost Savings and ROI Section - Infographic Style */}
      <section
        id="cost-savings"
        className="bg-muted/50 py-8 sm:py-10 bg-gray-100"
      >
        <div className="container">
          <motion.div
            className="mx-auto max-w-2xl text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Cost Savings and ROI
            </h2>
          </motion.div>
          <motion.div
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <div className="flex flex-col md:flex-row justify-center items-center gap-8">
              <motion.div variants={fadeIn} className="w-full md:w-1/3">
                <Card className="p-6 shadow-lg text-center">
                  <CheckCircle className="h-16 w-16 mb-4 mx-auto text-primary" />
                  {/* <h3 className="text-2xl font-bold mb-2">30%</h3> */}
                  <p className="text-muted-foreground">
                    Reduction in operational costs
                  </p>
                </Card>
              </motion.div>
              <motion.div variants={fadeIn} className="w-full md:w-1/3">
                <Card className="p-6 shadow-lg text-center">
                  <TrendingUpIcon className="h-16 w-16 mb-4 mx-auto text-primary" />
                  {/* <h3 className="text-2xl font-bold mb-2">25%</h3> */}
                  <p className="text-muted-foreground">
                    Increase in staff efficiency
                  </p>
                </Card>
              </motion.div>
              <motion.div variants={fadeIn} className="w-full md:w-1/3">
                <Card className="p-6 shadow-lg text-center">
                  <Users className="h-16 w-16 mb-4 mx-auto text-primary" />
                  {/* <h3 className="text-2xl font-bold mb-2">40%</h3> */}
                  <p className="text-muted-foreground">
                    Boost in resident satisfaction
                  </p>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Competitive Advantages Section - Accordion Style */}
      <section id="competitive-advantages" className="container py-5 sm:py-10">
        <motion.div
          className="mx-auto max-w-2xl text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Competitive Advantages
          </h2>
        </motion.div>
        <motion.div
          className="space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
        >
          {[
            {
              icon: LightbulbIcon,
              title: "Innovative Care",
              description:
                "Differentiate your facility with advanced AI technology that sets you apart in the market.",
            },
            {
              icon: Users,
              title: "Higher Retention Rates",
              description:
                "Enhanced resident and family satisfaction fosters loyalty and reduces turnover.",
            },
            {
              icon: TrendingUpIcon,
              title: "Future-Proof Solutions",
              description:
                "Stay ahead of the curve with scalable, adaptable AI that evolves with your needs.",
            },
          ].map((advantage, index) => (
            <motion.div key={index} variants={fadeIn}>
              <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-4">
                  <advantage.icon className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">{advantage.title}</h3>
                </div>
                <p className="mt-4 text-muted-foreground">
                  {advantage.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Scalability & Compliance Section - Split Screen */}
      <section
        id="scalability-compliance"
        className="bg-muted/50 py-7 sm:py-12 bg-gray-100"
      >
        <div className="container">
          <motion.div
            className="mx-auto max-w-2xl text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Scalability & Compliance
            </h2>
          </motion.div>
          <motion.div
            className="flex flex-col md:flex-row gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeIn} className="w-full md:w-1/2">
              <Card className="p-6 shadow-lg h-full">
                <Shield className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">
                  Flexible Implementation
                </h3>
                <p className="text-muted-foreground">
                  AI companions offer flexible implementation suitable for
                  diverse care settings, from independent living to memory care
                  units.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    <span>Customizable to facility needs</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    <span>Seamless integration with existing systems</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    <span>Scalable for facilities of all sizes</span>
                  </li>
                </ul>
              </Card>
            </motion.div>
            <motion.div variants={fadeIn} className="w-full md:w-1/2">
              <Card className="p-6 shadow-lg h-full">
                <CheckCircle className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">
                  Regulatory Compliance
                </h3>
                <p className="text-muted-foreground">
                  The technology supports regulatory compliance by tracking
                  engagement, well-being, and care quality metrics, ensuring
                  your facility meets and exceeds industry standards.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    <span>HIPAA compliant data handling</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    <span>Automated reporting for audits</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    <span>Regular updates to meet changing regulations</span>
                  </li>
                </ul>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact">
        <ContactPage />
      </section>

      {/* CTA Section
      <section className="container py-24 sm:py-32">
        <motion.div
          className="relative isolate overflow-hidden bg-background rounded-3xl px-6 py-24 shadow-2xl sm:px-24 xl:py-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Embrace the Future of Senior Care
            </h2>
            <p className="text-muted-foreground mb-8">
              Empower your facility to deliver exceptional care, optimize
              operations, and stand out in a competitive market with AI
              companions.
            </p>
            <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
              {/* <Button size="lg" className="shadow-lg">
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="shadow-sm">
                Learn More
              </Button>
              <motion.div variants={fadeIn}>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="shadow-sm cursor-pointer"
                  >
                    Contact Us
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
          <div className="absolute -z-10 inset-0 bg-white dark:white bg-[linear-gradient(to_right,rgba(200,200,200,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(200,200,200,0.2)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(176,186,201,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(176,186,201,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </motion.div>
      </section> */}

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
            <div>
              <Logo />
              <p className="text-muted-foreground text-left">
                Revolutionizing senior care with AI companions
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="#key-benefits"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Key Benefits
                  </Link>
                </li>
                <li>
                  <Link
                    href="#competitive-advantages"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Competitive Advantages
                  </Link>
                </li>
                <li>
                  <Link
                    href="#scalability-compliance"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Scalability & Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} AvatarX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
