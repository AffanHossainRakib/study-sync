'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Users, Clock, FileText, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { getStudyPlans, deleteStudyPlan, formatTime } from '@/lib/api';
import useAuth from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function MyStudyPlansPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchMyPlans();
  }, [user, token]);

  const fetchMyPlans = async () => {
    try {
      setLoading(true);
      const data = await getStudyPlans({ view: 'my' }, token);
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load study plans');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this study plan? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteStudyPlan(id, token);
      toast.success('Study plan deleted successfully');
      setPlans(prev => prev.filter(plan => plan._id !== id));
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete study plan');
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-3">My Study Plans</h1>
            <p className="text-lg text-muted-foreground">
              Plans you created or have been shared with you
            </p>
          </div>
          <Link
            href="/create-plan"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Plan
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
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
        ) : plans.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No study plans yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first study plan to get started organizing your learning
            </p>
            <Link
              href="/create-plan"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Study Plan
            </Link>
          </div>
        ) : (
          /* Plans Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCreator = plan.createdBy?._id === user.uid || plan.createdBy?._id === user._id;
              const isShared = !isCreator;

              return (
                <div
                  key={plan._id}
                  className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all"
                >
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
                          {plan.courseCode}
                        </span>
                        {isShared && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                            Shared
                          </span>
                        )}
                        {plan.isPublic && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                            Public
                          </span>
                        )}
                      </div>
                      {isCreator && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(plan._id);
                          }}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          disabled={deletingId === plan._id}
                        >
                          {deletingId === plan._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
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
                        {plan.resourceCount || 0}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(plan.totalTime)}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {plan.instanceCount || 0}
                      </div>
                    </div>

                    {isShared && (
                      <div className="text-xs text-muted-foreground">
                        Created by {plan.createdBy?.displayName || plan.createdBy?.email?.split('@')[0]}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
                    <Link
                      href={`/plans/${plan._id}`}
                      className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      View Details
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                    {(isCreator || plan.canEdit) && (
                      <Link
                        href={`/plans/${plan._id}/edit`}
                        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        {plans.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-2xl font-bold text-foreground mb-1">
                {plans.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Study Plans</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-2xl font-bold text-foreground mb-1">
                {plans.filter(p => p.createdBy?._id === user.uid || p.createdBy?._id === user._id).length}
              </div>
              <div className="text-sm text-muted-foreground">Created by You</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-2xl font-bold text-foreground mb-1">
                {plans.filter(p => p.createdBy?._id !== user.uid && p.createdBy?._id !== user._id).length}
              </div>
              <div className="text-sm text-muted-foreground">Shared with You</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
