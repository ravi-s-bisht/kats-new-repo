import Link from "next/link";
import { Button } from "@/components/ui/button_old";
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
} from "lucide-react";
import Image from "next/image";
import Logo from "@/components/dashboard/Header/logo";
import Header from "@/components/Header";

export default function Homepage() {
  return (
    <div className="flex min-h-screen flex-col w-full">
      {/* Hero Section */}
      <section className="relative">
        <div className="container flex flex-col items-center justify-center space-y-8 py-24 text-center md:py-32">
          <div className="mx-auto max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Your AI Companion for a Connected Life
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Engage, remind, and support your loved ones with our AI-powered
              companion
            </p>
          </div>
          <div
            className="flex flex-col gap-4 min-[400px]:flex-row z-11"
            style={{ zIndex: 10 }}
          >
            <Button size="lg" className="shadow-lg">
              Start Free Trial
            </Button>
            <Link href="/voice-avatars">
              <Button
                size="lg"
                variant="outline"
                className="shadow-sm cursor-pointer"
              >
                Try our Demo
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute z-0 inset-0 bg-[linear-gradient(to_right,rgba(200,200,200,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(200,200,200,0.2)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(176,186,201,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(176,186,201,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </section>

      <div className="relative mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-xl border bg-muted shadow-2xl mt-8 md:mt-12">
        <Image
          src="/placeholder.svg"
          alt="Senior using ElderlyCompanion AI"
          className="object-cover"
          fill
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Button size="lg" className="pointer-events-none">
            Watch Demo
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="container py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Features
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <MessageSquare className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-bold mb-2">Voice AI Companion</h3>
            <p className="text-muted-foreground">
              Choose from our preset voice avatars
            </p>
          </Card>
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <GamepadIcon className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-bold mb-2">Interactive Games</h3>
            <p className="text-muted-foreground">
              Stay mentally active with our collection of engaging games
              designed to enhance cognitive function and provide entertainment.
            </p>
          </Card>
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <Clock className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-bold mb-2">Medication Reminders</h3>
            <p className="text-muted-foreground">
              Never miss important medications with our automated reminder
              system and friendly voice calls.
            </p>
          </Card> */}
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <LightbulbIcon className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-bold mb-2">Innovative Care</h3>
            <p className="text-muted-foreground">
              Differentiate your facility with advanced AI technology that sets
              you apart in the market.
            </p>
          </Card>
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <HeartIcon className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-bold mb-2">Higher Retention Rates</h3>
            <p className="text-muted-foreground">
              Enhanced resident and family satisfaction fosters loyalty and
              reduces turnover.
            </p>
          </Card>
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
            <TrendingUpIcon className="h-12 w-12 mb-4" />
            <h3 className="text-xl font-bold mb-2">Future-proof Solutions</h3>
            <p className="text-muted-foreground">
              Stay ahead of the curve with scalable, adaptable AI that evolves
              with your needs.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-muted-foreground">
            Getting started with AvatarX is simple and straightforward
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Get Connected</h3>
            <p className="text-muted-foreground">
              Use our web platform to start your journey
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <Contact className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Meet Your Companion</h3>
            <p className="text-muted-foreground">
              Choose from our preset voice avatars
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Start Interacting</h3>
            <p className="text-muted-foreground">
              Begin chatting, playing games, and receiving helpful reminders
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-muted/50">
        <div className="container py-24 sm:py-32">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12 md:text-4xl">
            Loved by Seniors and Care Facilities
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote:
                  "AvatarX has become like a friend to me. The daily conversations and games keep me engaged and happy.",
                author: "Margaret, 75",
              },
              {
                quote:
                  "The medication reminders are a lifesaver. I never forget to take my pills now, and my family feels more at ease.",
                author: "Robert, 82",
              },
              {
                quote:
                  "As a caregiver, this platform gives me peace of mind knowing my mother has companionship even when I'm not there.",
                author: "Sarah, Caregiver",
              },
            ].map((testimonial, i) => (
              <Card key={i} className="p-6 shadow-lg">
                <div className="space-y-4">
                  <p className="text-muted-foreground italic">
                    {'"' + testimonial.quote + '"'}
                  </p>
                  <p className="font-semibold">{testimonial.author}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-24 sm:py-32">
        <div className="relative isolate overflow-hidden bg-background rounded-3xl px-6 py-24 shadow-2xl sm:px-24 xl:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Start Your Journey Today
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of seniors experiencing the joy of companionship
              with our AI platform
            </p>
            <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
              <Button size="lg" className="shadow-lg">
                Get Started for Free
              </Button>
              <Button size="lg" variant="outline" className="shadow-sm">
                Contact Sales
              </Button>
            </div>
          </div>
          <div className="absolute -z-10 inset-0 bg-white dark:white bg-[linear-gradient(to_right,rgba(200,200,200,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(200,200,200,0.2)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(176,186,201,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(176,186,201,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-16">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Logo />
              </div>
              <p className="text-muted-foreground">
                Making technology accessible and meaningful for seniors
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
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
