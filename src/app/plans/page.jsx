'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Clock, FileText, Users, ArrowRight, BookOpen } from 'lucide-react';
import { getStudyPlans, formatTime } from '@/lib/api';
import useAuth from '@/hooks/useAuth';

export default function AllPlansPage() {
  const { token } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchPlans();
  }, [sortBy]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const params = {
        view: 'public',
        sort: sortBy
      };
      const data = await getStudyPlans(params, token);
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter plans based on search and course filter
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !courseFilter || plan.courseCode.toLowerCase().includes(courseFilter.toLowerCase());
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-3">All Study Plans</h1>
          <p className="text-lg text-muted-foreground">
            Browse public study plans created by the community. Start an instance to begin learning.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
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
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredPlans.length} of {plans.length} study plans
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
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
        ) : filteredPlans.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No study plans found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || courseFilter
                ? 'Try adjusting your filters'
                : 'Be the first to create a study plan!'}
            </p>
            <Link
              href="/create-plan"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
            >
              Create Study Plan
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        ) : (
          /* Plans Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
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
                      {plan.instanceCount || 0} instances
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                    {plan.title}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
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

                  {/* Creator Info */}
                  <div className="text-xs text-muted-foreground">
                    By {plan.createdBy?.displayName || plan.createdBy?.email?.split('@')[0] || 'Anonymous'}
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
        )}
      </div>
    </div>
  );
}
