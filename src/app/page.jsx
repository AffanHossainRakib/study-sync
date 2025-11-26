import Hero from "@/components/Home/Hero";
import HowItWorks from "@/components/Home/HowItWorks";
import Features from "@/components/Home/Features";

import PopularPlans from "@/components/Home/PopularPlans";
import Testimonials from "@/components/Home/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <Testimonials />
      <PopularPlans />
    </>
  );
}
