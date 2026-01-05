import React from "react";
import { Youtube, FileText, Link2, CheckCircle2 } from "lucide-react";
import HeroButtons from "./HeroButtons";

const Hero = () => {
  const features = [
    {
      icon: Youtube,
      title: "YouTube Videos",
      description: "Organize playlists and tutorials",
      gradient: "from-red-500/10 to-red-600/10",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-600 dark:text-red-400",
    },
    {
      icon: FileText,
      title: "PDFs & Documents",
      description: "Manage study materials",
      gradient: "from-blue-500/10 to-blue-600/10",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: Link2,
      title: "Web Articles",
      description: "Save learning resources",
      gradient: "from-green-500/10 to-green-600/10",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      icon: CheckCircle2,
      title: "Track Progress",
      description: "Monitor your learning journey",
      gradient: "from-primary/10 to-primary/20",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-[80vh] sm:min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-primary/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="grid lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-16 items-center">
          {/* Left Content - 60% */}
          <div className="lg:col-span-3 text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in-up">
              <span className="text-sm font-semibold text-primary">
                Welcome to the Future of Learning
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 sm:mb-6 animate-fade-in-up [animation-delay:200ms]">
              <span className="block text-foreground">Centralize Your</span>
              <span className="block text-primary mt-2">Learning Journey</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up [animation-delay:400ms]">
              Stop juggling scattered YouTube playlists, PDFs, and articles. The
              Study Sync brings all your learning resources into one organized
              platform with smart progress tracking and collaboration tools.
            </p>

            {/* CTA Buttons */}
            <HeroButtons />

            {/* Key Benefits */}
            <div className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground animate-fade-in-up [animation-delay:600ms]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Get Started in Minutes</span>
              </div>
            </div>
          </div>

          {/* Right Feature Cards - 40% */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className={`group relative bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border border-border rounded-xl p-4 sm:p-6 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-fade-in-right`}
                    style={{ animationDelay: `${200 + index * 100}ms` }}
                  >
                    {/* Animated background shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

                    <div className="relative">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${feature.iconBg} mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}
                      >
                        <Icon
                          className={`h-6 w-6 sm:h-7 sm:w-7 ${feature.iconColor}`}
                        />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
