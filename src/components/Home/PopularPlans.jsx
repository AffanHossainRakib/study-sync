'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, FileText, Users, ArrowRight } from 'lucide-react';
import { getStudyPlans, formatTime } from '@/lib/api';

const PopularPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularPlans();
  }, []);

  const fetchPopularPlans = async () => {
    try {
      // Fetch public plans sorted by newest (for MVP)
      const data = await getStudyPlans({ view: 'public', sort: 'newest' });
      // Show only first 3 plans
      setPlans(data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching popular plans:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 sm:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-primary mb-3">Popular Study Plans</h2>
            <p className="text-3xl sm:text-4xl font-bold text-foreground">
              Explore what others are learning
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (plans.length === 0) {
    return null;
  }

  return (
    <section className="py-20 sm:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base font-semibold text-primary mb-3">Popular Study Plans</h2>
          <p className="text-3xl sm:text-4xl font-bold text-foreground">
            Explore what others are learning
          </p>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse public study plans and start your own instance to begin learning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all"
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
                    {plan.courseCode}
                  </span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Users className="h-3 w-3 mr-1" />
                    {plan.instanceCount || 0}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                  {plan.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {plan.shortDescription}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {plan.resourceCount || 0} resources
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTime(plan.totalTime)}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-muted/30 border-t border-border">
                <Link
                  href={`/plans/${plan._id}`}
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  View Details
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA to browse all */}
        <div className="text-center">
          <Link
            href="/plans"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-all"
          >
            Browse All Study Plans
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularPlans;
