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
      const newStatus = !currentStatus;

      // Call API to toggle completion
      await toggleResourceCompletion(instance._id, resourceId, newStatus, token);

      // Update local state instead of refetching
      setInstance(prevInstance => {
        // Update the specific resource's completion status
        const updatedResources = prevInstance.resources.map(res =>
          res._id === resourceId
            ? { ...res, completed: newStatus, completedAt: newStatus ? new Date().toISOString() : null }
            : res
        );

        // Calculate new progress
        const completedCount = updatedResources.filter(r => r.completed).length;
        const totalCount = updatedResources.length;
        const resourcePercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

        // Calculate completed time
        const completedTime = updatedResources.reduce((sum, res) => {
          if (!res.completed) return sum;
          const time = res.type === "youtube-video"
            ? res.metadata?.duration || 0
            : res.type === "pdf"
            ? (res.metadata?.pages || 0) * (res.metadata?.minsPerPage || 0)
            : res.metadata?.estimatedMins || 0;
          return sum + time;
        }, 0);

        const totalTime = prevInstance.totalTime || 0;
        const timePercent = totalTime > 0 ? (completedTime / totalTime) * 100 : 0;
        const remainingTime = totalTime - completedTime;

        return {
          ...prevInstance,
          resources: updatedResources,
          completedResources: completedCount,
          resourcePercent,
          completedTime,
          timePercent,
          remainingTime
        };
      });

      toast.success(currentStatus ? 'Marked as incomplete' : 'Marked as complete!');
    } catch (error) {
      console.error('Error toggling completion:', error);
      toast.error('Failed to update progress');
      // Revert state on error by refetching
      await fetchInstanceDetails();
    } finally {
      setTogglingResource(null);
    }
  };

  const handleUpdate = (updatedInstance) => {
    setInstance(prev => ({ ...prev, ...updatedInstance }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-8" />
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-4" />
            <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded w-full mb-8" />
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/instances"
          className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to My Instances
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-900 rounded-2xl p-8 mb-6 shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-4 shadow-lg">
                {instance.studyPlanId?.courseCode || 'N/A'}
              </span>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                {instance.customTitle || instance.studyPlanId?.title || 'Untitled Instance'}
              </h1>
              {instance.notes && (
                <p className="text-slate-600 dark:text-slate-400 italic">{instance.notes}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <Link
                href={`/plans/${instance.studyPlanId?._id}`}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-center"
              >
                View Original Plan
              </Link>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-5 mb-6">
            {/* Resource Progress */}
            <div>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="font-bold text-slate-900 dark:text-white">Resource Completion</span>
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  {instance.completedResources || 0}/{instance.totalResources || 0} completed ({Math.round(progressPercent)}%)
                </span>
              </div>
              <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 shadow-lg"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Time Progress */}
            <div>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="font-bold text-slate-900 dark:text-white">Time Progress</span>
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  {formatTime(instance.completedTime || 0)}/{formatTime(instance.totalTime || 0)} ({Math.round(timePercent)}%)
                </span>
              </div>
              <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 shadow-lg"
                  style={{ width: `${timePercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium">
              <Clock className="h-4 w-4" />
              {formatTime(instance.remainingTime || 0)} remaining
            </div>
            {instance.deadline && (
              <div className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg font-medium">
                Deadline: {new Date(instance.deadline).toLocaleDateString()}
              </div>
            )}
            <div className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-medium">
              Started: {new Date(instance.startedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Resources List */}
        <div className="bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-900 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Resources ({instance.resources?.length || 0})
            </h2>
          </div>

          {instance.resources && instance.resources.length > 0 ? (
            <div className="space-y-3">
              {instance.resources.map((resource, index) => {
                const typeInfo = getResourceTypeInfo(resource.type);
                const Icon = typeInfo.icon === 'Youtube' ? Youtube : FileText;
                const isCompleted = resource.completed || false;
                const isToggling = togglingResource === resource._id;
                const totalTime =
                  resource.type === "youtube-video"
                    ? resource.metadata?.duration
                    : resource.type === "pdf"
                      ? (resource.metadata?.pages || 0) *
                        (resource.metadata?.minsPerPage || 0)
                      : (resource.type === "article" || resource.type === "google-drive" || resource.type === "custom-link")
                        ? resource.metadata?.estimatedMins || 0
                        : 0;

                return (
                  <div
                    key={resource._id}
                    className={`flex items-start gap-4 p-5 rounded-xl transition-all border-2 ${isCompleted
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-300 dark:border-green-900/50 shadow-lg'
                      : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-800'
                      }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(resource._id, isCompleted)}
                      disabled={isToggling}
                      className="flex-shrink-0 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full disabled:opacity-50 transform hover:scale-110 transition-transform"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400 drop-shadow-lg" />
                      ) : (
                        <Circle className="h-7 w-7 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
                      )}
                    </button>

                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className={`p-2.5 rounded-xl shadow-md ${resource.type === 'youtube-video' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                        resource.type === 'pdf' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                          'bg-gradient-to-br from-green-500 to-green-600'
                        }`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`text-base font-bold mb-2 ${isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'
                            }`}>
                            {index + 1}. {resource.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold ${
                              resource.type === 'youtube-video' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                              resource.type === 'pdf' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                              'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            }`}>
                              {typeInfo.label}
                            </span>
                            <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                              <Clock className="h-3.5 w-3.5" />
                              {formatTime(totalTime)}
                            </span>
                            {isCompleted && resource.completedAt && (
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                ✓ {new Date(resource.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors transform hover:scale-110"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400 text-center py-8 font-medium">
              No resources in this instance.
            </p>
          )}
        </div>

        {/* Completion Message */}
        {progressPercent === 100 && (
          <div className="mt-6 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-2xl p-8 text-center text-white shadow-2xl">
            <div className="bg-white/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-12 w-12 text-white drop-shadow-lg" />
            </div>
            <h3 className="text-3xl font-bold mb-3 drop-shadow-lg">
              Congratulations!
            </h3>
            <p className="text-lg font-medium text-white/95 max-w-md mx-auto">
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
