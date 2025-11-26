'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  FileText,
  Youtube,
  ExternalLink,
  CheckCircle2,
  Circle,
  Edit
} from 'lucide-react';
import {
  getInstanceById,
  toggleResourceCompletion,
  formatTime,
  getResourceTypeInfo
} from '@/lib/api';
import useAuth from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import EditInstanceModal from '@/components/EditInstanceModal';

export default function InstanceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();

  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingResource, setTogglingResource] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (params.id) {
      fetchInstanceDetails();
    }
  }, [params.id, user, token]);

  const fetchInstanceDetails = async () => {
    try {
      setLoading(true);
      const data = await getInstanceById(params.id, token);
      setInstance(data);
    } catch (error) {
      console.error('Error fetching instance:', error);
      toast.error('Failed to load instance');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (resourceId, currentStatus) => {
    try {
      setTogglingResource(resourceId);
      await toggleResourceCompletion(resourceId, !currentStatus, token);

      // Refresh instance data to update progress
      await fetchInstanceDetails();

      toast.success(currentStatus ? 'Marked as incomplete' : 'Marked as complete!');
    } catch (error) {
      console.error('Error toggling completion:', error);
      toast.error('Failed to update progress');
    } finally {
      setTogglingResource(null);
    }
  };

  const handleUpdate = (updatedInstance) => {
    setInstance(prev => ({ ...prev, ...updatedInstance }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8" />
            <div className="h-10 bg-muted rounded w-3/4 mb-4" />
            <div className="h-24 bg-muted rounded w-full mb-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!instance || !user) {
    return null;
  }

  const progressPercent = instance.resourcePercent || 0;
  const timePercent = instance.timePercent || 0;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/instances"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to My Instances
        </Link>

        {/* Header */}
        <div className="bg-card border border-border rounded-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-primary/10 text-primary mb-3">
                {instance.studyPlanId?.courseCode || 'N/A'}
              </span>
              <h1 className="text-3xl font-bold text-foreground mb-3">
                {instance.customTitle || instance.studyPlanId?.title || 'Untitled Instance'}
              </h1>
              {instance.notes && (
                <p className="text-muted-foreground">{instance.notes}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <Link
                href={`/plans/${instance.studyPlanId?._id}`}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View Original Plan
              </Link>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-4 mb-6">
            {/* Resource Progress */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-foreground">Resource Completion</span>
                <span className="text-muted-foreground">
                  {instance.completedResources || 0}/{instance.totalResources || 0} completed ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Time Progress */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-foreground">Time Progress</span>
                <span className="text-muted-foreground">
                  {formatTime(instance.completedTime || 0)}/{formatTime(instance.totalTime || 0)} ({timePercent}%)
                </span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${timePercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {formatTime(instance.remainingTime || 0)} remaining
            </div>
            {instance.deadline && (
              <div>
                Deadline: {new Date(instance.deadline).toLocaleDateString()}
              </div>
            )}
            <div>
              Started: {new Date(instance.startedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Resources List */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Resources ({instance.resources?.length || 0})
            </h2>
          </div>

          {instance.resources && instance.resources.length > 0 ? (
            <div className="space-y-2">
              {instance.resources.map((resource, index) => {
                const typeInfo = getResourceTypeInfo(resource.type);
                const Icon = typeInfo.icon === 'Youtube' ? Youtube : FileText;
                const isCompleted = resource.completed || false;
                const isToggling = togglingResource === resource._id;

                return (
                  <div
                    key={resource._id}
                    className={`flex items-start gap-4 p-4 rounded-lg transition-all ${isCompleted
                      ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30'
                      : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                      }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(resource._id, isCompleted)}
                      disabled={isToggling}
                      className="flex-shrink-0 mt-1 focus:outline-none focus:ring-2 focus:ring-primary rounded disabled:opacity-50"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </button>

                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-md ${resource.type === 'youtube-video' ? 'bg-red-100 dark:bg-red-900/20' :
                        resource.type === 'pdf' ? 'bg-blue-100 dark:bg-blue-900/20' :
                          'bg-green-100 dark:bg-green-900/20'
                        }`}>
                        <Icon className={`h-5 w-5 ${resource.type === 'youtube-video' ? 'text-red-600 dark:text-red-400' :
                          resource.type === 'pdf' ? 'text-blue-600 dark:text-blue-400' :
                            'text-green-600 dark:text-green-400'
                          }`} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`text-sm font-medium mb-1 ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}>
                            {index + 1}. {resource.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-background border border-border">
                              {typeInfo.label}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(resource.totalTime || 0)}
                            </span>
                            {isCompleted && resource.completedAt && (
                              <span className="text-green-600 dark:text-green-400">
                                Completed {new Date(resource.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No resources in this instance.
            </p>
          )}
        </div>

        {/* Completion Message */}
        {progressPercent === 100 && (
          <div className="mt-6 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-lg p-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              Congratulations!
            </h3>
            <p className="text-green-700 dark:text-green-300">
              You have completed all resources in this study plan. Keep up the great work!
            </p>
          </div>
        )}
      </div>

      <EditInstanceModal
        instance={instance}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUpdate}
        token={token}
      />
    </div >
  );
}
