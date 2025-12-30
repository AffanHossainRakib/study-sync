"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const HeroButtons = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start animate-fade-in-up [animation-delay:400ms]">
      {user ? (
        <>
          <Link
            href="/create-plan"
            className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Create Study Plan
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/instances"
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-xl border-2 border-primary/20 bg-background hover:bg-accent transition-all duration-300"
          >
            My Instances
          </Link>
        </>
      ) : (
        <>
          <Link
            href="/register"
            className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-xl bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/plans"
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-xl border-2 border-primary/20 bg-background hover:bg-accent transition-all duration-300"
          >
            Browse Study Plans
          </Link>
        </>
      )}
    </div>
  );
};

export default HeroButtons;
