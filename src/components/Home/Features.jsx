"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Globe,
  Users,
  CheckCircle2,
  Clock,
  RefreshCw,
  Share2,
  Youtube,
  FileText,
} from "lucide-react";
import { useInView } from "react-intersection-observer";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const Features = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 50]);

  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const features = [
    {
      icon: Youtube,
      title: "YouTube Integration",
      description:
        "Auto-import playlists with video titles, durations, and thumbnails using YouTube API.",
      gradient: "from-red-500 to-pink-500",
    },
    {
      icon: CheckCircle2,
      title: "Global Progress Tracking",
      description:
        "Mark a resource complete once, it stays marked everywhere. Never lose track of what you have learned.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Share2,
      title: "Collaborative Plans",
      description:
        "Share study plans with friends via email. Edit together while maintaining individual progress.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: RefreshCw,
      title: "Reusable Resources",
      description:
        "Already watched a video? Add it to a new plan and it is automatically marked as complete.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Clock,
      title: "Smart Time Estimates",
      description:
        "Automatic calculation of total study time. Plan your learning schedule effectively.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: FileText,
      title: "Multi-Format Support",
      description:
        "Organize YouTube videos, PDFs, slides, and articles all in one centralized location.",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: Users,
      title: "Public & Private",
      description:
        "Keep plans private or share publicly. Clone others' plans to kickstart your learning.",
      gradient: "from-pink-500 to-purple-500",
    },
    {
      icon: Globe,
      title: "Course-Based Organization",
      description:
        "Tag plans with course codes (CSE110, EEE220, etc.) for easy filtering and discovery.",
      gradient: "from-indigo-500 to-purple-500",
    },
  ];

  return (
    <section
      id="features"
      className="relative py-12 sm:py-20 lg:py-24 bg-background overflow-hidden"
    >
      {/* Parallax background elements */}
      <motion.div style={{ y }} className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          className="text-center mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            Features
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Powerful features designed specifically for self-learners who use
            online resources
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={fadeInUp}
                custom={index}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative bg-card border border-border rounded-2xl p-6 hover:shadow-2xl hover:border-primary/50 transition-all duration-300"
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
                />

                <div className="relative">
                  {/* Icon with gradient */}
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-4 shadow-lg`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
