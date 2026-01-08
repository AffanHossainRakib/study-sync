"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  FileText,
  Youtube,
  ExternalLink,
  CheckCircle2,
  Circle,
  Edit,
  Play,
  StickyNote,
  Info,
  X,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  getInstanceById,
  toggleResourceCompletion,
  formatTime,
  getResourceTypeInfo,
  saveResourceNotes,
} from "@/lib/api";
import useAuth from "@/hooks/useAuth";
import toast from "react-hot-toast";
import EditInstanceModal from "@/components/EditInstanceModal";
import EmbeddedMediaPlayer from "@/components/EmbeddedMediaPlayer";

export default function InstanceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingResource, setTogglingResource] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState(null);
  const [resourceNotes, setResourceNotes] = useState({});
  const [showNotes, setShowNotes] = useState(false);
  const [showFeatureHints, setShowFeatureHints] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [theaterMode, setTheaterMode] = useState(false);
  const saveNotesTimeoutRef = useRef(null);

  // Check if first time viewing this page (for feature hints)
  useEffect(() => {
    const hasSeenHints = localStorage.getItem("hasSeenInstanceFeatureHints");
    if (!hasSeenHints) {
      setShowFeatureHints(true);
    }
  }, []);

  const dismissHints = () => {
    setShowFeatureHints(false);
    localStorage.setItem("hasSeenInstanceFeatureHints", "true");
  };

  // Load resource notes from instance data (database)
  useEffect(() => {
    if (instance?.resourceNotes) {
      setResourceNotes(instance.resourceNotes);
    }
  }, [instance?.resourceNotes]);

  // Auto-select first incomplete resource when instance loads
  useEffect(() => {
    if (instance?.resources?.length > 0 && !selectedResourceId) {
      // Find first incomplete resource, or first resource if all complete
      const firstIncomplete = instance.resources.find(r => !r.completed);
      const resourceToSelect = firstIncomplete || instance.resources[0];
      setSelectedResourceId(resourceToSelect._id);
    }
  }, [instance?.resources, selectedResourceId]);

  // Save notes to database with debouncing
  const saveResourceNote = useCallback(
    (resourceId, note) => {
      const newNotes = { ...resourceNotes, [resourceId]: note };
      setResourceNotes(newNotes);

      if (saveNotesTimeoutRef.current) {
        clearTimeout(saveNotesTimeoutRef.current);
      }

      saveNotesTimeoutRef.current = setTimeout(async () => {
        if (!instance?._id || !token) return;

        try {
          setSavingNotes(true);
          await saveResourceNotes(instance._id, newNotes, token);
        } catch (error) {
          console.error("Error saving notes:", error);
          toast.error("Failed to save notes");
        } finally {
          setSavingNotes(false);
        }
      }, 1000);
    },
    [resourceNotes, instance?._id, token]
  );

  // Handle playing next resource
  const handlePlayNext = useCallback(() => {
    if (!instance?.resources || !selectedResourceId) return;

    const currentIndex = instance.resources.findIndex(r => r._id === selectedResourceId);
    if (currentIndex < instance.resources.length - 1) {
      setSelectedResourceId(instance.resources[currentIndex + 1]._id);
    }
  }, [instance?.resources, selectedResourceId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (params.id) {
      fetchInstanceDetails();
    }
  }, [params.id, user, token, authLoading]);

  const fetchInstanceDetails = async () => {
    try {
      setLoading(true);
      const data = await getInstanceById(params.id, token);
      setInstance(data);
    } catch (error) {
      console.error("Error fetching instance:", error);
      toast.error("Failed to load instance");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (resourceId, currentStatus) => {
    try {
      setTogglingResource(resourceId);
      const newStatus = !currentStatus;

      await toggleResourceCompletion(instance._id, resourceId, newStatus, token);

      setInstance((prevInstance) => {
        const updatedResources = prevInstance.resources.map((res) =>
          res._id === resourceId
            ? { ...res, completed: newStatus, completedAt: newStatus ? new Date().toISOString() : null }
            : res
        );

        const completedCount = updatedResources.filter((r) => r.completed).length;
        const totalCount = updatedResources.length;
        const resourcePercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

        const completedTime = updatedResources.reduce((sum, res) => {
          if (!res.completed) return sum;
          const time =
            res.type === "youtube-video"
              ? res.metadata?.duration || 0
              : res.type === "pdf"
                ? (res.metadata?.pages || 0) * (res.metadata?.minsPerPage || 0)
                : res.metadata?.estimatedMins || 0;
          return sum + time;
        }, 0);

        const totalTime = prevInstance.totalTime || 0;
        const timePercent = totalTime > 0 ? (completedTime / totalTime) * 100 : 0;

        return {
          ...prevInstance,
          resources: updatedResources,
          completedResources: completedCount,
          resourcePercent,
          completedTime,
          timePercent,
          remainingTime: totalTime - completedTime,
        };
      });

      toast.success(currentStatus ? "Marked as incomplete" : "Marked as complete!");
    } catch (error) {
      console.error("Error toggling completion:", error);
      toast.error("Failed to update progress");
      await fetchInstanceDetails();
    } finally {
      setTogglingResource(null);
    }
  };

  const handleUpdate = (updatedInstance) => {
    setInstance((prev) => ({ ...prev, ...updatedInstance }));
  };

  // Get selected resource
  const selectedResource = instance?.resources?.find(r => r._id === selectedResourceId);
  const selectedIndex = instance?.resources?.findIndex(r => r._id === selectedResourceId) ?? -1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-6" />
            <div className="flex gap-6">
              <div className="flex-1">
                <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
              </div>
              <div className="w-80 hidden lg:block">
                <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!instance || !user) return null;

  const progressPercent = instance.resourcePercent || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Top Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/instances"
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {instance.customTitle || instance.studyPlanId?.title || "Untitled"}
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{instance.completedResources || 0}/{instance.totalResources || 0} completed</span>
                  <span>•</span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Edit instance"
              >
                <Edit className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Feature Hints */}
      {showFeatureHints && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 shadow-lg text-white relative">
            <button
              onClick={dismissHints}
              className="absolute top-2 right-2 p-1 rounded-full bg-white/20 hover:bg-white/30"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <Info className="h-5 w-5" />
              <span><strong>Tip:</strong> Click any resource in the playlist to play it. Videos auto-advance when finished!</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - YouTube Style Layout */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        <div className={`flex flex-col ${theaterMode ? '' : 'lg:flex-row'} gap-6`}>

          {/* Left: Main Player Area */}
          <div className={`min-w-0 ${theaterMode ? 'w-full' : 'flex-1'}`}>
            {selectedResource ? (
              <>
                {/* Video Player */}
                <div className={`bg-black rounded-xl overflow-hidden shadow-2xl ${theaterMode ? 'min-h-[70vh]' : ''}`}>
                  <EmbeddedMediaPlayer
                    resource={selectedResource}
                    instanceId={instance._id}
                    isExpanded={true}
                    theaterMode={theaterMode}
                    onClose={() => { }}
                    onComplete={() => {
                      if (!selectedResource.completed) {
                        handleToggleComplete(selectedResource._id, false);
                      }
                    }}
                    onPlayNext={handlePlayNext}
                  />
                </div>

                {/* Theater Mode Toggle */}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setTheaterMode(!theaterMode)}
                    className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title={theaterMode ? 'Exit theater mode (T)' : 'Theater mode (T)'}
                  >
                    {theaterMode ? (
                      <><Minimize2 className="h-4 w-4" /> Exit Theater</>
                    ) : (
                      <><Maximize2 className="h-4 w-4" /> Theater Mode</>
                    )}
                  </button>
                </div>

                {/* Video Info */}
                <div className="mt-4 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-800">
                  {/* Title - Full width */}
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {selectedIndex + 1}. {selectedResource.title}
                  </h2>

                  {/* Info and Actions - Stack on mobile, row on desktop */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full font-medium ${selectedResource.type === "youtube-video"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        : selectedResource.type === "pdf"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        }`}>
                        {getResourceTypeInfo(selectedResource.type).label}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="h-4 w-4" />
                        {formatTime(
                          selectedResource.type === "youtube-video"
                            ? selectedResource.metadata?.duration
                            : selectedResource.type === "pdf"
                              ? (selectedResource.metadata?.pages || 0) * (selectedResource.metadata?.minsPerPage || 0)
                              : selectedResource.metadata?.estimatedMins || 0
                        )}
                      </span>
                      {selectedResource.completed && (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-4 w-4" />
                          Completed
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleComplete(selectedResource._id, selectedResource.completed)}
                        disabled={togglingResource === selectedResource._id}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedResource.completed
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                      >
                        {selectedResource.completed ? "✓ Completed" : "Mark Complete"}
                      </button>
                      <button
                        onClick={() => setShowNotes(!showNotes)}
                        className={`p-2 rounded-lg transition-all ${showNotes || resourceNotes[selectedResource._id]
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
                          }`}
                        title="Toggle notes"
                      >
                        <StickyNote className="h-5 w-5" />
                      </button>
                      <a
                        href={selectedResource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {showNotes && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Your Notes
                      </label>
                      <textarea
                        placeholder="Add your notes for this resource..."
                        value={resourceNotes[selectedResource._id] || ""}
                        onChange={(e) => saveResourceNote(selectedResource._id, e.target.value)}
                        className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                      />
                      <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
                        <span>Auto-saved • Synced across devices</span>
                        {savingNotes && <span className="text-blue-500">Saving...</span>}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <p className="text-slate-500">Select a resource to play</p>
              </div>
            )}
          </div>

          {/* Right: Playlist Sidebar */}
          {!theaterMode && (
            <div className="w-full lg:w-96 flex-shrink-0">
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-36">
                {/* Playlist Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Playlist • {instance.resources?.length || 0} items
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span>{instance.completedResources || 0} completed</span>
                    <span>•</span>
                    <span>{formatTime(instance.remainingTime || 0)} remaining</span>
                  </div>
                </div>

                {/* Playlist Items */}
                <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
                  {instance.resources?.map((resource, index) => {
                    const isSelected = selectedResourceId === resource._id;
                    const isCompleted = resource.completed;
                    const typeInfo = getResourceTypeInfo(resource.type);
                    const Icon = typeInfo.icon === "Youtube" ? Youtube : FileText;
                    const totalTime =
                      resource.type === "youtube-video"
                        ? resource.metadata?.duration
                        : resource.type === "pdf"
                          ? (resource.metadata?.pages || 0) * (resource.metadata?.minsPerPage || 0)
                          : resource.metadata?.estimatedMins || 0;

                    return (
                      <button
                        key={resource._id}
                        onClick={() => setSelectedResourceId(resource._id)}
                        className={`w-full flex items-start gap-3 p-3 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isSelected
                          ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                          : "border-l-4 border-transparent"
                          }`}
                      >
                        {/* Playing indicator or index */}
                        <div className="w-6 flex-shrink-0 flex items-center justify-center">
                          {isSelected ? (
                            <Play className="h-4 w-4 text-blue-600 dark:text-blue-400 fill-current" />
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">{index + 1}</span>
                          )}
                        </div>

                        {/* Thumbnail/Icon */}
                        <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${resource.type === "youtube-video"
                          ? "bg-red-100 dark:bg-red-900/30"
                          : resource.type === "pdf"
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : "bg-green-100 dark:bg-green-900/30"
                          }`}>
                          <Icon className={`h-5 w-5 ${resource.type === "youtube-video"
                            ? "text-red-600 dark:text-red-400"
                            : resource.type === "pdf"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-green-600 dark:text-green-400"
                            }`} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium truncate ${isCompleted
                            ? "text-slate-400 line-through"
                            : "text-slate-900 dark:text-white"
                            }`}>
                            {resource.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span>{formatTime(totalTime)}</span>
                            {resourceNotes[resource._id] && (
                              <StickyNote className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                        </div>

                        {/* Completion Status */}
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Theater Mode: Playlist Strip Below */}
          {theaterMode && (
            <div className="w-full mt-4">
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Up Next • {instance.resources?.length || 0} items
                  </span>
                  <span className="text-xs text-slate-500">
                    {instance.completedResources || 0}/{instance.totalResources || 0} completed
                  </span>
                </div>
                <div className="overflow-y-auto">
                  {instance.resources?.map((resource, index) => {
                    const isSelected = selectedResourceId === resource._id;
                    const isCompleted = resource.completed;
                    const typeInfo = getResourceTypeInfo(resource.type);
                    const Icon = typeInfo.icon === "Youtube" ? Youtube : FileText;
                    const totalTime =
                      resource.type === "youtube-video"
                        ? resource.metadata?.duration
                        : resource.type === "pdf"
                          ? (resource.metadata?.pages || 0) * (resource.metadata?.minsPerPage || 0)
                          : resource.metadata?.estimatedMins || 0;

                    return (
                      <button
                        key={resource._id}
                        onClick={() => setSelectedResourceId(resource._id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 last:border-b-0 ${isSelected
                          ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500"
                          : "border-l-4 border-l-transparent"
                          }`}
                      >
                        <span className="w-6 text-center text-xs text-slate-400 font-medium">
                          {isSelected ? <Play className="h-4 w-4 text-blue-600 fill-current mx-auto" /> : index + 1}
                        </span>
                        <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${resource.type === "youtube-video" ? "bg-red-100 dark:bg-red-900/30" : "bg-blue-100 dark:bg-blue-900/30"
                          }`}>
                          <Icon className={`h-4 w-4 ${resource.type === "youtube-video" ? "text-red-600" : "text-blue-600"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium truncate block ${isCompleted ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-300"
                            }`}>
                            {resource.title}
                          </span>
                          <span className="text-xs text-slate-400">{formatTime(totalTime)}</span>
                        </div>
                        {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Completion Message */}
        {progressPercent === 100 && (
          <div className="mt-8 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-2xl p-8 text-center text-white shadow-2xl">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
            <p className="text-white/90">You have completed all resources in this study plan.</p>
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
    </div>
  );
}
