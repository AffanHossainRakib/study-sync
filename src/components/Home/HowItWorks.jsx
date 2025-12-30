import React from "react";
import { FolderPlus, ListPlus, Play, BarChart3 } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: FolderPlus,
      title: "Create a Study Plan",
      description:
        "Start by creating a study plan for your course or learning goal. Add a title, description, and course code.",
    },
    {
      icon: ListPlus,
      title: "Add Resources",
      description:
        "Import YouTube playlists, add PDFs, or link articles. We automatically fetch video durations and calculate total study time.",
    },
    {
      icon: Play,
      title: "Start an Instance",
      description:
        "Create a personal instance of the study plan. This is your active learning session with customizable notes and deadlines.",
    },
    {
      icon: BarChart3,
      title: "Track Progress",
      description:
        "Mark resources as complete. Your progress is tracked globally, so completed resources stay marked across all plans.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative py-12 sm:py-20 lg:py-24 bg-muted/30 overflow-hidden"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16 animate-fade-in-up">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Get organized in four simple steps
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            From scattered resources to structured learning in minutes
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative animate-fade-in-up"
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -z-10" />
                )}

                <div className="relative h-full bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl hover:border-primary/50 hover:-translate-y-2 transition-all duration-300">
                  {/* Step Number Badge */}
                  <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base sm:text-lg font-bold shadow-lg">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className="inline-flex p-2 sm:p-4 rounded-lg sm:rounded-xl bg-primary/10 mb-4 sm:mb-5">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
