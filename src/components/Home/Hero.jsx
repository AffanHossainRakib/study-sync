'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Youtube, FileText, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[90rem] -translate-x-1/2 stroke-muted-foreground/10 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]">
          <svg className="h-full w-full" aria-hidden="true">
            <defs>
              <pattern
                id="hero-pattern"
                width="200"
                height="200"
                x="50%"
                y="-1"
                patternUnits="userSpaceOnUse"
              >
                <path d="M100 200V.5M.5 .5H200" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth="0" fill="url(#hero-pattern)" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1>
              <span className="block text-sm font-semibold text-primary mb-4">
                Welcome to StudySync
              </span>
              <span className="mt-1 block text-4xl tracking-tight font-bold sm:text-5xl xl:text-6xl">
                <span className="block text-foreground">Centralize Your</span>
                <span className="block text-primary mt-2">Learning Journey</span>
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:mt-8 sm:text-xl lg:text-lg xl:text-xl">
              Stop juggling scattered YouTube playlists, PDFs, and articles. StudySync brings all your learning resources into one organized platform with smart progress tracking.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start gap-4">
              {user ? (
                <>
                  <Link
                    href="/create-plan"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all"
                  >
                    Create Study Plan
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/instances"
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-all"
                  >
                    My Instances
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/plans"
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-all"
                  >
                    Browse Study Plans
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-6">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">500+</div>
                <div className="mt-1 text-sm text-muted-foreground">Study Plans</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">10K+</div>
                <div className="mt-1 text-sm text-muted-foreground">Hours Tracked</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">2K+</div>
                <div className="mt-1 text-sm text-muted-foreground">Active Learners</div>
              </div>
            </div>
          </div>

          {/* Visual Content */}
          <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6">
            <div className="relative">
              {/* Feature Cards */}
              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-md bg-red-100 dark:bg-red-900/20">
                      <Youtube className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="font-semibold text-foreground">YouTube</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Auto-import playlists with video durations
                  </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/20">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-semibold text-foreground">PDFs</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track reading progress page by page
                  </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/20">
                      <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-semibold text-foreground">Articles</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Organize blog posts and tutorials
                  </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/20">
                      <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="font-semibold text-foreground">Progress</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Global tracking across all plans
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
