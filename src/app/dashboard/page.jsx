"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Target,
  ArrowRight,
  Loader2,
  AlertCircle,
  Plus,
  PlayCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { getInstances } from "@/lib/api";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && token) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const instancesResponse = await getInstances(token);
      setInstances(instancesResponse.instances || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingDeadlines = () => {
    return instances
      .filter((inst) => inst.deadline)
      .map((inst) => ({
        ...inst,
        daysUntil: Math.ceil(
          (new Date(inst.deadline) - new Date()) / (1000 * 60 * 60 * 24)
        ),
      }))
      .filter((inst) => inst.daysUntil >= 0)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 3);
  };

  const getDisplayTitle = (instance) => {
    const courseCode = instance.studyPlan?.courseCode || "General";
    const title = instance.customTitle || instance.studyPlan?.title;
    return courseCode !== "General" ? `${courseCode} - ${title}` : title;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900 dark:text-white" />
      </div>
    );
  }

  const lastAccessedInstance = instances[0];
  const otherInstances = instances.slice(1);
  const deadlines = getUpcomingDeadlines();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-purple-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Welcome back, {user?.displayName || "Learner"}
            </p>
          </div>
          <Link
            href="/create-plan"
            className="px-3 py-2 md:px-5 md:py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg text-xs md:text-sm"
          >
            <Plus className="h-4 w-4" />
            Create New Plan
          </Link>
        </div>

        {instances.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
            <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No active study plans yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Start by browsing available study plans or creating your own to
              begin your learning journey
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/plans"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Browse Plans
              </Link>
              <Link
                href="/create-plan"
                className="px-6 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-900 dark:text-white transition-all"
              >
                Create Plan
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Section: Continue Learning & Deadlines */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Continue Learning - Takes up 2 columns */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-primary" />
                  Continue Learning
                </h2>

                <Link
                  href={`/instances/${lastAccessedInstance._id}`}
                  className="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wide">
                          Most Recent
                        </span>
                        {lastAccessedInstance.lastAccessedAt && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(lastAccessedInstance.lastAccessedAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                        {getDisplayTitle(lastAccessedInstance)}
                      </h3>

                      <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-2">
                        {lastAccessedInstance.studyPlanId?.shortDescription}
                      </p>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {lastAccessedInstance.completedResources}/{lastAccessedInstance.totalResources} Resources
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {Math.round((lastAccessedInstance.completedTime || 0) / 60)}h spent
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:w-48 flex flex-col justify-center">
                      <div className="mb-2 flex justify-between text-sm font-medium">
                        <span className="text-slate-700 dark:text-slate-300">Progress</span>
                        <span className="text-primary">{Math.round(lastAccessedInstance.resourcePercent || 0)}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${lastAccessedInstance.resourcePercent || 0}%` }}
                        />
                      </div>
                      <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                        Resume
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Deadlines - Takes up 1 column */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  Upcoming Deadlines
                </h2>

                {deadlines.length > 0 ? (
                  <div className="space-y-3">
                    {deadlines.map((instance) => (
                      <Link
                        key={instance._id}
                        href={`/instances/${instance._id}`}
                        className="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-md transition-all hover:border-orange-300 dark:hover:border-orange-900/50 group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors pr-2">
                            {getDisplayTitle(instance)}
                          </h4>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${instance.daysUntil <= 2
                            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200"
                            }`}>
                            {instance.daysUntil === 0 ? "Today" : `${instance.daysUntil} days`}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          Due {new Date(instance.deadline).toLocaleDateString()}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2 opacity-50" />
                    <p className="text-slate-500 text-sm">No upcoming deadlines</p>
                  </div>
                )}
              </div>
            </div>

            {/* Other Active Plans Grid */}
            {otherInstances.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-500" />
                    Your Courses
                  </h2>
                  <Link href="/instances" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherInstances.slice(0, 6).map((instance) => (
                    <Link
                      key={instance._id}
                      href={`/instances/${instance._id}`}
                      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="h-1 bg-slate-200 dark:bg-slate-800 group-hover:bg-indigo-500 transition-colors" />
                      <div className="p-5">
                        <div className="mb-4">
                          <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {getDisplayTitle(instance)}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>{instance.completedResources}/{instance.totalResources} Resources</span>
                            <span>{Math.round(instance.resourcePercent || 0)}%</span>
                          </div>
                        </div>

                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-900 dark:bg-slate-100 group-hover:bg-indigo-500 transition-all duration-300"
                            style={{ width: `${instance.resourcePercent || 0}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions (Compact) */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <Link href="/plans" className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  Browse All Plans
                </Link>
                <Link href="/my-plans" className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  My Created Plans
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
