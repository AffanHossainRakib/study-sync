'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, CheckCircle2, ArrowRight, Trash2, Loader2, Edit } from 'lucide-react';
import { getInstances, deleteInstance, formatTime } from '@/lib/api';
import useAuth from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import EditInstanceModal from '@/components/EditInstanceModal';

export default function MyInstancesPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [editingInstance, setEditingInstance] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchInstances();
  }, [user, token]);

  const fetchInstances = async () => {
    try {
      setLoading(true);
      const data = await getInstances(token);
      setInstances(data);
    } catch (error) {
      console.error('Error fetching instances:', error);
      toast.error('Failed to load instances');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this instance?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteInstance(id, token);
      toast.success('Instance deleted successfully');
      setInstances(prev => prev.filter(inst => inst._id !== id));
    } catch (error) {
      console.error('Error deleting instance:', error);
      toast.error('Failed to delete instance');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (instance) => {
    setEditingInstance(instance);
    setIsEditModalOpen(true);
  };

  const handleUpdate = (updatedInstance) => {
    setInstances(prev => prev.map(inst =>
      inst._id === updatedInstance._id ? { ...inst, ...updatedInstance } : inst
    ));
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
            <h1 className="text-4xl font-bold text-foreground mb-3">My Study Instances</h1>
            <p className="text-lg text-muted-foreground">
              Track your active learning sessions and monitor progress
            </p>
          </div>
          <Link
            href="/plans"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Browse Plans
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                <div className="h-20 bg-muted rounded w-full mb-4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : instances.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No active instances</h3>
            <p className="text-muted-foreground mb-6">
              Start learning by creating an instance from a study plan
            </p>
            <Link
              href="/plans"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
            >
              Browse Study Plans
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        ) : (
          /* Instances Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instances.map((instance) => {
              const progressPercent = instance.resourcePercent || 0;
              const timePercent = instance.timePercent || 0;

              return (
                <div
                  key={instance._id}
                  className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all"
                >
                  {/* Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
                        {instance.studyPlanId?.courseCode || 'N/A'}
                      </span>
                      <div className="flex items-center">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleEdit(instance);
                          }}
                          className="text-muted-foreground hover:text-foreground transition-colors mr-2"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(instance._id);
                          }}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          disabled={deletingId === instance._id}
                        >
                          {deletingId === instance._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                      {instance.customTitle || instance.studyPlanId?.title || 'Untitled Instance'}
                    </h3>

                    {instance.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {instance.notes}
                      </p>
                    )}

                    {/* Progress Section */}
                    <div className="space-y-3 mb-4">
                      {/* Resource Progress */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Resources</span>
                          <span className="font-medium text-foreground">
                            {instance.completedResources || 0}/{instance.totalResources || 0}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Time Progress */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Time</span>
                          <span className="font-medium text-foreground">
                            {formatTime(instance.completedTime || 0)}/{formatTime(instance.totalTime || 0)}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ width: `${timePercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        {progressPercent}%
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(instance.remainingTime || 0)} left
                      </div>
                    </div>

                    {instance.deadline && (
                      <div className="mt-3 text-xs text-muted-foreground">
                        Deadline: {new Date(instance.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-muted/30 border-t border-border">
                    <Link
                      href={`/instances/${instance._id}`}
                      className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Continue Learning
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <EditInstanceModal
        instance={editingInstance}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUpdate}
        token={token}
      />
    </div>
  );
}
