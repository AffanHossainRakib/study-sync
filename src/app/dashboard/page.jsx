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

    instancesData.forEach((instance) => {
      const completed = instance.completedResourceIds?.length || 0;
      const total = instance.snapshotResourceIds?.length || 0;
      totalCompleted += completed;
      totalResources += total;
    });

    const completionRate =
      totalResources > 0 ? (totalCompleted / totalResources) * 100 : 0;

    setStats({
      activeInstances: instancesData.length,
      totalCompletion: completionRate,
      completedResources: totalCompleted,
      totalResources,
      totalTimeSpent: 0, // Will be implemented with study sessions
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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome back, {user?.displayName || "Learner"}! Here&apos;s your
            learning overview.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Study Plans */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-8 h-8 text-slate-900 dark:text-white" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.activeInstances}
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Active Plans
            </h3>
          </div>

          {/* Overall Completion */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-slate-900 dark:text-white" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {Math.round(stats.totalCompletion)}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Overall Progress
            </h3>
          </div>

          {/* Resources Completed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="w-8 h-8 text-slate-900 dark:text-white" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.completedResources}/{stats.totalResources}
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Resources Done
            </h3>
          </div>

          {/* Study Plans Created */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-slate-900 dark:text-white" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {myPlans.length}
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Plans Created
            </h3>
          </div>
        </div>

        {/* Active Study Plans Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Active Study Plans
            </h2>
            <Link
              href="/instances"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {instances.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No active study plans yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Start by browsing available study plans or creating your own
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/plans"
                  className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 font-medium"
                >
                  Browse Plans
                </Link>
                <Link
                  href="/create-plan"
                  className="px-6 py-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 font-medium text-slate-900 dark:text-white"
                >
                  Create Plan
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instances.slice(0, 6).map((instance) => {
                const completed = instance.completedResourceIds?.length || 0;
                const total = instance.snapshotResourceIds?.length || 0;
                const percentage = total > 0 ? (completed / total) * 100 : 0;

                return (
                  <Link
                    key={instance._id}
                    href={`/instances/${instance._id}`}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1">
                        {instance.customTitle || instance.studyPlanId?.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {instance.studyPlanId?.courseCode || "General"}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-600 dark:text-slate-400">
                          Progress
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressColor(
                            percentage
                          )} transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {completed}/{total} done
                        </span>
                      </div>
                      {instance.deadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(instance.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/plans"
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 hover:shadow-lg transition-all group"
          >
            <BookOpen className="w-8 h-8 text-slate-900 dark:text-white mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Browse Plans
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Discover study plans created by the community
            </p>
            <div className="flex items-center text-sm font-medium text-slate-900 dark:text-white group-hover:gap-2 transition-all">
              Explore
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            href="/create-plan"
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 hover:shadow-lg transition-all group"
          >
            <Target className="w-8 h-8 text-slate-900 dark:text-white mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Create Plan
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Build a custom study plan with your resources
            </p>
            <div className="flex items-center text-sm font-medium text-slate-900 dark:text-white group-hover:gap-2 transition-all">
              Get Started
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            href="/my-plans"
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 hover:shadow-lg transition-all group"
          >
            <TrendingUp className="w-8 h-8 text-slate-900 dark:text-white mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              My Plans
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Manage your created study plans
            </p>
            <div className="flex items-center text-sm font-medium text-slate-900 dark:text-white group-hover:gap-2 transition-all">
              View Plans
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
