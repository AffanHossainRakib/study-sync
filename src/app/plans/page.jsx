"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Clock,
  FileText,
  Users,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { getStudyPlans, formatTime } from "@/lib/api";
import useAuth from "@/hooks/useAuth";

export default function AllPlansPage() {
  const { token } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to page 1 on filter change
      fetchPlans(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, courseFilter, sortBy]);

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchPlans(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fetchPlans = async (pageNum = page) => {
    try {
      setLoading(true);
      const params = {
        view: "public",
        sort: sortBy,
        page: pageNum,
        limit: 9,
        search: searchTerm,
        courseCode: courseFilter,
      };
      const data = await getStudyPlans(params, token);
      setPlans(data.plans || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            All Study Plans
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Browse public study plans created by the community. Start an
            instance to begin learning.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-900 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>

            {/* Course Code Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter by course code (e.g., CSE110)..."
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="shortest">Shortest Duration</option>
            </select>
          </div>

          {/* Results Count */}
          {!loading && pagination && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {plans.length} of {pagination.totalPlans} study plans
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-lg p-6 animate-pulse"
              >
                <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3 mb-4" />
                <div className="flex gap-4">
                  <div className="h-4 bg-muted rounded w-20" />
                  <div className="h-4 bg-muted rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          /* Empty State */
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-16 text-center">
            <div className="bg-slate-200 dark:bg-slate-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-10 w-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              No study plans found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {searchTerm || courseFilter
                ? "Try adjusting your filters"
                : "Be the first to create a study plan!"}
            </p>
            <Link
              href="/create-plan"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-base font-medium text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Create Study Plan
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {plans.map((plan, index) => {
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
                  <div
                    key={plan._id}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105"
                  >
                    {/* Colorful Header */}
                    <div
                      className={`h-2 bg-gradient-to-r ${gradient} group-hover:h-3 transition-all`}
                    />

                    {/* Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${gradient} text-white`}
                        >
                          {plan.courseCode}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                          <Users className="h-3 w-3 text-green-500" />
                          <span className="font-medium">
                            {plan.instanceCount || 0}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                        {plan.courseCode} - {plan.title}
                      </h3>

                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                        {plan.shortDescription}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1 text-blue-500" />
                          <span className="font-medium">
                            {plan.resourceCount || 0}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-purple-500" />
                          <span className="font-medium">
                            {formatTime(plan.totalTime)}
                          </span>
                        </div>
                      </div>

                      {/* Creator Info */}
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {(
                            plan.createdBy?.displayName ||
                            plan.createdBy?.email ||
                            "A"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          By{" "}
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {plan.createdBy?.displayName ||
                              plan.createdBy?.email?.split("@")[0] ||
                              "Anonymous"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                      <Link
                        href={`/plans/${String(plan._id)}`}
                        className="inline-flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      >
                        View Details
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-6 py-2 bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-900 rounded-xl text-sm font-bold text-blue-600 dark:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-400 dark:hover:border-blue-600 transition-all disabled:hover:bg-white dark:disabled:hover:bg-slate-900"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-lg">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-6 py-2 bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-900 rounded-xl text-sm font-bold text-blue-600 dark:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-400 dark:hover:border-blue-600 transition-all disabled:hover:bg-white dark:disabled:hover:bg-slate-900"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
