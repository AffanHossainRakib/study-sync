'use client';

import React from 'react';
import { FolderPlus, ListPlus, Play, BarChart3 } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: FolderPlus,
      title: 'Create a Study Plan',
      description: 'Start by creating a study plan for your course or learning goal. Add a title, description, and course code.',
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
    },
    {
      icon: ListPlus,
      title: 'Add Resources',
      description: 'Import YouTube playlists, add PDFs, or link articles. We automatically fetch video durations and calculate total study time.',
      color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
    },
    {
      icon: Play,
      title: 'Start an Instance',
      description: 'Create a personal instance of the study plan. This is your active learning session with customizable notes and deadlines.',
      color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      description: 'Mark resources as complete. Your progress is tracked globally, so completed resources stay marked across all plans.',
      color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base font-semibold text-primary mb-3">How It Works</h2>
          <p className="text-3xl sm:text-4xl font-bold text-foreground">
            Get organized in four simple steps
          </p>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From scattered resources to structured learning in minutes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connector Line (hidden on mobile, shown on desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-border -z-10" />
                )}

                <div className="relative bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all">
                  {/* Step Number */}
                  <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-lg ${step.color} mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
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
