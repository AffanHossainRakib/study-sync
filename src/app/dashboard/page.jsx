"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Target,
  ArrowRight,
  Loader2,
  AlertCircle,
  Plus,
  Award,
  Zap,
  Bell,
} from "lucide-react";
import { getInstances, getStudyPlans, formatTime } from "@/lib/api";
import useAuth from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [instances, setInstances] = useState([]);
  const [myPlans, setMyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeInstances: 0,
    totalCompletion: 0,
    completedResources: 0,
    totalResources: 0,
    totalTimeSpent: 0,
  });

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
      const [instancesResponse, plansResponse] = await Promise.all([
        getInstances(token),
        getStudyPlans({ view: "my" }, token),
      ]);

      // API returns { instances: [...] } and { studyPlans: [...] }
      const instancesData = instancesResponse.instances || [];
      const plansData = plansResponse.studyPlans || [];

      setInstances(instancesData);
      setMyPlans(plansData);
      calculateStats(instancesData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (instancesData) => {
    let totalCompleted = 0;
    let totalResources = 0;
    let totalTimeSpent = 0;

    instancesData.forEach((instance) => {
      const completed = instance.completedResources || 0; // Count, not array
      const total = instance.totalResources || 0;
      totalCompleted += completed;
      totalResources += total;
      totalTimeSpent += instance.completedTime || 0;
    });

    const completionRate =
      totalResources > 0 ? (totalCompleted / totalResources) * 100 : 0;

    setStats({
      activeInstances: instancesData.length,
      totalCompletion: completionRate,
      completedResources: totalCompleted,
      totalResources,
      totalTimeSpent,
    });
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 50) return "bg-blue-500";
    if (percentage >= 25) return "bg-yellow-500";
    return "bg-slate-300 dark:bg-slate-600";
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-900 dark:text-white" />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Welcome back, {user?.displayName || "Learner"}!
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Let&apos;s continue your learning journey
              </p>
            </div>
            <Link
              href="/create-plan"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              Create Plan
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Study Plans */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-fit mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="text-4xl font-bold mb-2">
                {stats.activeInstances}
              </div>
              <h3 className="text-blue-100 font-medium">Active Plans</h3>
            </div>
          </div>

          {/* Overall Completion */}
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-fit mb-4">
                <Target className="w-8 h-8" />
              </div>
              <div className="text-4xl font-bold mb-2">
                {Math.round(stats.totalCompletion)}%
              </div>
              <h3 className="text-purple-100 font-medium">Overall Progress</h3>
            </div>
          </div>

          {/* Resources Completed */}
          <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-fit mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="text-4xl font-bold mb-2">
                {stats.completedResources}/{stats.totalResources}
              </div>
              <h3 className="text-green-100 font-medium">Resources Done</h3>
            </div>
          </div>

          {/* Study Plans Created */}
          <div className="relative overflow-hidden bg-gradient-to-br from-pink-500 to-rose-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-fit mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="text-4xl font-bold mb-2">{myPlans.length}</div>
              <h3 className="text-pink-100 font-medium">Plans Created</h3>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        {getUpcomingDeadlines().length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="w-6 h-6 text-orange-500" />
              Upcoming Deadlines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getUpcomingDeadlines().map((instance) => {
                const courseCode =
                  instance.studyPlanId?.courseCode || "General";
                const title =
                  instance.customTitle || instance.studyPlanId?.title;
                const displayTitle =
                  courseCode !== "General" ? `${courseCode} - ${title}` : title;

                return (
                  <Link
                    key={instance._id}
                    href={`/instances/${instance._id}`}
                    className="bg-white dark:bg-slate-900 border-2 border-orange-200 dark:border-orange-900 rounded-xl p-4 hover:shadow-lg transition-all hover:border-orange-400"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span>
                        {instance.studyPlan.courseCode} -{" "}
                        {instance.studyPlan.title}
                      </span>
                      <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 flex-1 mr-2">
                        {displayTitle}
                      </h3>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          instance.daysUntil <= 2
                            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                            : instance.daysUntil <= 7
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        }`}
                      >
                        {instance.daysUntil === 0
                          ? "Today"
                          : instance.daysUntil === 1
                          ? "Tomorrow"
                          : `${instance.daysUntil}d`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(instance.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Study Plans Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              Active Study Plans
            </h2>
            <Link
              href="/instances"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {instances.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center">
              <div className="bg-slate-200 dark:bg-slate-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-slate-400 dark:text-slate-500" />
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
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instances.slice(0, 6).map((instance, index) => {
                const completed = instance.completedResources || 0;
                const total = instance.totalResources || 0;
                const percentage = instance.resourcePercent || 0;

                const gradients = [
                  "from-blue-500 to-cyan-500",
                  "from-purple-500 to-pink-500",
                  "from-orange-500 to-red-500",
                  "from-green-500 to-teal-500",
                  "from-indigo-500 to-purple-500",
                  "from-yellow-500 to-orange-500",
                ];

                const gradient = gradients[index % gradients.length];

                return (
                  <Link
                    key={instance._id}
                    href={`/instances/${instance._id}`}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105"
                  >
                    {/* Colorful Header */}
                    <div
                      className={`h-2 bg-gradient-to-r ${gradient} group-hover:h-3 transition-all`}
                    />

                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                          {instance.customTitle || instance.studyPlanId?.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${gradient} text-white`}
                          >
                            <span>
                              {instance.studyPlan.courseCode} -{" "}
                              {instance.studyPlan.title}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">
                            Progress
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500 shadow-lg`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="font-medium">
                            {completed}/{total} done
                          </span>
                        </div>
                        {instance.deadline && (
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Calendar className="w-4 h-4 text-orange-500" />
                            <span className="font-medium text-xs">
                              {new Date(instance.deadline).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/plans"
              className="relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-900 rounded-2xl p-6 hover:shadow-2xl transition-all group hover:border-blue-400 dark:hover:border-blue-600"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-3 w-fit mb-4 shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Browse Plans
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Discover study plans created by the community
                </p>
                <div className="flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                  Explore Now
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link
              href="/create-plan"
              className="relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-900 rounded-2xl p-6 hover:shadow-2xl transition-all group hover:border-purple-400 dark:hover:border-purple-600"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-3 w-fit mb-4 shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Create Plan
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Build a custom study plan with your resources
                </p>
                <div className="flex items-center text-sm font-bold text-purple-600 dark:text-purple-400 group-hover:gap-2 transition-all">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link
              href="/my-plans"
              className="relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-green-200 dark:border-green-900 rounded-2xl p-6 hover:shadow-2xl transition-all group hover:border-green-400 dark:hover:border-green-600"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
              <div className="relative">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-3 w-fit mb-4 shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  My Plans
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Manage your created study plans
                </p>
                <div className="flex items-center text-sm font-bold text-green-600 dark:text-green-400 group-hover:gap-2 transition-all">
                  View Plans
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
