import { motion } from "framer-motion";
import ContactForm from "@/components/ContactForm";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ContactPage() {
  return (
    <section className="w-full py-8 md:py-10 lg:py-10">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
            Contact Us
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            We&apos;re here to help. Reach out to us for any questions or
            inquiries about our AI companions for senior care facilities.
          </p>
        </motion.div>
        <div className="flex items-center justify-center py-8 lg:py-12">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}