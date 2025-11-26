'use client';

import React from 'react';
import {
  Globe,
  Users,
  CheckCircle2,
  Clock,
  RefreshCw,
  Share2,
  Youtube,
  FileText
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Youtube,
      title: 'YouTube Integration',
      description: 'Auto-import playlists with video titles, durations, and thumbnails using YouTube API.',
      color: 'bg-red-50 dark:bg-red-900/10'
    },
    {
      icon: CheckCircle2,
      title: 'Global Progress Tracking',
      description: 'Mark a resource complete once, it stays marked everywhere. Never lose track of what you have learned.',
      color: 'bg-green-50 dark:bg-green-900/10'
    },
    {
      icon: Share2,
      title: 'Collaborative Plans',
      description: 'Share study plans with friends via email. Edit together while maintaining individual progress.',
      color: 'bg-blue-50 dark:bg-blue-900/10'
    },
    {
      icon: RefreshCw,
      title: 'Reusable Resources',
      description: 'Already watched a video? Add it to a new plan and it is automatically marked as complete.',
      color: 'bg-purple-50 dark:bg-purple-900/10'
    },
    {
      icon: Clock,
      title: 'Smart Time Estimates',
      description: 'Automatic calculation of total study time. Plan your learning schedule effectively.',
      color: 'bg-orange-50 dark:bg-orange-900/10'
    },
    {
      icon: FileText,
      title: 'Multi-Format Support',
      description: 'Organize YouTube videos, PDFs, slides, and articles all in one centralized location.',
      color: 'bg-cyan-50 dark:bg-cyan-900/10'
    },
    {
      icon: Users,
      title: 'Public & Private',
      description: 'Keep plans private or share publicly. Clone others\' plans to kickstart your learning.',
      color: 'bg-pink-50 dark:bg-pink-900/10'
    },
    {
      icon: Globe,
      title: 'Course-Based Organization',
      description: 'Tag plans with course codes (CSE110, EEE220, etc.) for easy filtering and discovery.',
      color: 'bg-indigo-50 dark:bg-indigo-900/10'
    }
  ];

  return (
    <section id="features" className="py-20 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base font-semibold text-primary mb-3">Features</h2>
          <p className="text-3xl sm:text-4xl font-bold text-foreground">
            Everything you need to succeed
          </p>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed specifically for self-learners who use online resources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/50 transition-all"
              >
                <div className={`inline-flex p-3 rounded-lg ${feature.color} mb-4`}>
                  <Icon className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
