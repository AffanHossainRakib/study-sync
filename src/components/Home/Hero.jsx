"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, TrendingUp, Users, BookOpen, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { fadeInUp, fadeInRight, staggerContainer } from "@/lib/animations";

const Hero = () => {
  const { user } = useAuth();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -30]);

  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  const stats = [
    {
      icon: BookOpen,
      value: 1247,
      label: "Study Plans",
      suffix: "+",
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: Users,
      value: 3580,
      label: "Active Learners",
      suffix: "+",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: TrendingUp,
      value: 15420,
      label: "Hours Tracked",
      suffix: "+",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Target,
      value: 94,
      label: "Success Rate",
      suffix: "%",
      color: "from-orange-500 to-pink-500",
    },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-[80vh] sm:min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background"
    >
      {/* Modern gradient mesh background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          style={{ y: y1 }}
          className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div
          className="grid lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-16 items-center"
          ref={ref}
        >
          {/* Left Content - 60% */}
          <motion.div
            className="lg:col-span-3 text-center lg:text-left"
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <span className="text-sm font-semibold text-primary">
                Welcome to the Future of Learning
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 sm:mb-6"
            >
              <span className="block text-foreground">Centralize Your</span>
              <span className="block bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent mt-2">
                Learning Journey
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Stop juggling scattered YouTube playlists, PDFs, and articles.
              StudySync brings all your learning resources into one organized
              platform with smart progress tracking and collaboration tools.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
            >
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
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={fadeInUp}
              className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground"
            >
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-3">
                  {[
                    "https://randomuser.me/api/portraits/women/44.jpg",
                    "https://randomuser.me/api/portraits/men/32.jpg",
                    "https://randomuser.me/api/portraits/women/68.jpg",
                    "https://randomuser.me/api/portraits/men/46.jpg",
                  ].map((avatar, i) => (
                    <Image
                      key={i}
                      src={avatar}
                      alt={`Learner ${i + 1}`}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border-2 border-background object-cover"
                      unoptimized
                    />
                  ))}
                </div>
                <span>Join 3,500+ learners</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★★★★★</span>
                <span className="ml-1">4.9/5 rating</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Stats Cards - 40% */}
          <motion.div
            className="lg:col-span-2"
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    variants={fadeInRight}
                    custom={index}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group relative bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-6 hover:shadow-2xl hover:border-primary/50 transition-all duration-300"
                  >
                    {/* Gradient background on hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 rounded-xl sm:rounded-2xl transition-opacity duration-300`}
                    />

                    <div className="relative flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4">
                      <div
                        className={`flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div className="text-center sm:text-left">
                        <div className="text-xl sm:text-3xl font-bold text-foreground flex items-baseline justify-center sm:justify-start">
                          {inView && (
                            <CountUp
                              end={stat.value}
                              duration={2.5}
                              separator=","
                              suffix={stat.suffix}
                            />
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5 sm:mt-1">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
