import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  FileText,
  Users,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

// Server-side fetch function
async function getPopularPlans() {
  try {
    // Use NEXT_PUBLIC_APP_URL for server-side fetching, fallback to localhost for dev
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                    process.env.NEXT_PUBLIC_API_URL ||
                    "http://localhost:3000";

    const response = await fetch(
      `${baseUrl}/api/study-plans?view=public&sort=newest`,
      {
        next: { revalidate: 300 }, // Revalidate every 5 minutes
        cache: 'no-store', // Disable caching during development
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch plans");
    }

    const data = await response.json();
    return (data.plans || []).slice(0, 4); // Return first 4 plans
  } catch (error) {
    console.error("Error fetching popular plans:", error);
    return [];
  }
}

function formatTime(seconds) {
  if (!seconds) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

const PopularPlans = async () => {
  const plans = await getPopularPlans();

  if (plans.length === 0) {
    return null;
  }

  return (
    <section
      id="popular-plans"
      className="py-12 sm:py-20 lg:py-24 bg-background relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16 animate-fade-in-up">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            Popular Study Plans
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Explore what others are learning
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Browse public study plans and start your own instance to begin
            learning
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {plans.map((plan, index) => (
            <div
              key={plan._id}
              className="group relative bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-2xl hover:border-primary/30 hover:-translate-y-2 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${200 + index * 100}ms` }}
            >
              {/* Trending badge for first plan */}
              {index === 0 && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-primary text-primary-foreground text-xs font-bold px-2 sm:px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <TrendingUp className="h-3 w-3" />
                  Trending
                </div>
              )}

              {/* Header */}
              <div className="p-4 sm:p-6 pb-3 sm:pb-4">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {plan.courseCode}
                  </span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Users className="h-3 w-3 mr-1" />
                    {plan.instanceCount || 0}
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3.5rem]">
                  {plan.courseCode} - {plan.title}
                </h3>

                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3 sm:mb-4">
                  {plan.shortDescription}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    {plan.resourceCount || 0}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {formatTime(plan.totalTime)}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-muted/30 border-t border-border">
                <Link
                  href={`/plans/${plan._id}`}
                  className="inline-flex items-center text-xs sm:text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
                >
                  View Details
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA to browse all */}
        <div className="text-center animate-fade-in-up [animation-delay:600ms]">
          <Link
            href="/plans"
            className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-xl border-2 border-primary/20 bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-sm hover:shadow-lg"
          >
            Browse All Study Plans
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularPlans;
