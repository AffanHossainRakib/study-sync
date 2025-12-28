"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Youtube,
  FileText,
  Link as LinkIcon,
  Loader2,
  Share2,
  X,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import {
  getStudyPlanById,
  updateStudyPlan,
  createOrGetResource,
  shareStudyPlan,
  removeCollaborator,
} from "@/lib/api";

// ... (inside component)

const handleRemoveCollaborator = async (userId) => {
  try {
    await removeCollaborator(params.id, userId, token);

    toast.success("Collaborator removed");
    await fetchPlanData();
  } catch (error) {
    console.error("Error removing collaborator:", error);
    toast.error("Failed to remove collaborator");
  }
};
import toast from "react-hot-toast";

function SortableResourceItem({ resource, index, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: resource.localId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="text-sm font-medium text-muted-foreground">
        {index + 1}
      </div>
      <div
        className={`flex-shrink-0 p-2 rounded-md ${
          resource.type === "youtube-video"
            ? "bg-red-100 dark:bg-red-900/20"
            : resource.type === "pdf"
              ? "bg-blue-100 dark:bg-blue-900/20"
              : "bg-green-100 dark:bg-green-900/20"
        }`}
      >
        {resource.type === "youtube-video" ? (
          <Youtube className="h-4 w-4 text-red-600 dark:text-red-400" />
        ) : resource.type === "pdf" ? (
          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        ) : (
          <LinkIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {resource.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {resource.type === "youtube-video" &&
            `${resource.metadata?.duration || 0} mins`}
          {resource.type === "pdf" && `${resource.metadata?.pages || 0} pages`}
          {resource.type === "article" &&
            `${resource.metadata?.estimatedMins || 0} mins`}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onRemove()}
        className="flex-shrink-0 p-2 text-destructive hover:bg-destructive/10 rounded-md transition-all"
        title="Remove this resource"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function EditStudyPlanPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    fullDescription: "",
    courseCode: "",
    isPublic: false,
  });

  const [resources, setResources] = useState([]);
  const [resourceForm, setResourceForm] = useState({
    type: "youtube-video",
    url: "",
    title: "",
    pages: "",
    minsPerPage: "3",
    estimatedMins: "",
  });
  const [addingResource, setAddingResource] = useState(false);

  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [sharing, setSharing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (params.id && token) {
      fetchPlanData();
    }
  }, [params.id, user, token, authLoading]);

  const fetchPlanData = async () => {
    try {
      setLoading(true);
      const data = await getStudyPlanById(params.id, token);

      // Check if user has edit access using the canEdit field from backend
      if (!data.canEdit) {
        toast.error("You do not have permission to edit this study plan");
        router.push(`/plans/${params.id}`);
        return;
      }

      setPlan(data);
      setFormData({
        title: data.title || "",
        shortDescription: data.shortDescription || "",
        fullDescription: data.fullDescription || "",
        courseCode: data.courseCode || "",
        isPublic: data.isPublic || false,
      });

      // Backend returns resourceIds (populated), not resources
      const existingResources = data.resourceIds || data.resources || [];
      console.log("Loaded existing resources:", existingResources.length);
      setResources(
        existingResources.map((r) => ({
          ...r,
          localId: Math.random().toString(36).substr(2, 9),
        }))
      );
    } catch (error) {
      console.error("Error fetching plan:", error);
      toast.error("Failed to load study plan");
      router.push("/my-plans");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleResourceFormChange = (e) => {
    const { name, value } = e.target;
    setResourceForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddResource = async () => {
    if (!resourceForm.url) {
      toast.error("Please enter a URL");
      return;
    }

    try {
      setAddingResource(true);

      let resourceData = {
        type: resourceForm.type,
        url: resourceForm.url,
      };

      // Add type-specific fields
      if (resourceForm.type === "pdf") {
        if (!resourceForm.title || !resourceForm.pages) {
          toast.error("Please fill in all PDF fields");
          return;
        }
        resourceData = {
          ...resourceData,
          title: resourceForm.title,
          pages: parseInt(resourceForm.pages),
          minsPerPage: parseInt(resourceForm.minsPerPage),
        };
      } else if (resourceForm.type === "article") {
        if (!resourceForm.title || !resourceForm.estimatedMins) {
          toast.error("Please fill in all article fields");
          return;
        }
        resourceData = {
          ...resourceData,
          title: resourceForm.title,
          estimatedMins: parseInt(resourceForm.estimatedMins),
        };
      }

      const result = await createOrGetResource(resourceData, token);

      if (resourceForm.type === "youtube-playlist" && result.resources) {
        const newResources = result.resources.map((r) => ({
          ...r,
          localId: Math.random().toString(36).substr(2, 9),
        }));
        setResources((prev) => [...prev, ...newResources]);
        toast.success(`Added ${result.resources.length} videos from playlist`);
      } else if (result.resource) {
        const newResource = {
          ...result.resource,
          localId: Math.random().toString(36).substr(2, 9),
        };
        setResources((prev) => [...prev, newResource]);
        toast.success(
          result.isNew ? "Resource added" : "Existing resource added"
        );
      }

      // Reset form
      setResourceForm({
        type: "youtube-video",
        url: "",
        title: "",
        pages: "",
        minsPerPage: "3",
        estimatedMins: "",
      });
    } catch (error) {
      console.error("Error adding resource:", error);
      toast.error(error.message || "Failed to add resource");
    } finally {
      setAddingResource(false);
    }
  };

  const handleRemoveResource = (index) => {
    setResources((prev) => prev.filter((_, i) => i !== index));
    toast.success("Resource removed");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setResources((items) => {
        const oldIndex = items.findIndex((item) => item.localId === active.id);
        const newIndex = items.findIndex((item) => item.localId === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleShare = async () => {
    if (!shareEmail) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setSharing(true);
      await shareStudyPlan(
        params.id,
        { email: shareEmail, role: "editor" },
        token
      );
      toast.success(`Study plan shared with ${shareEmail}`);
      setShareEmail("");
      setShowShareDialog(false);
      // Refresh plan data to show new collaborator
      await fetchPlanData();
    } catch (error) {
      console.error("Error sharing plan:", error);
      toast.error(error.message || "Failed to share study plan");
    } finally {
      setSharing(false);
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    try {
      // API endpoint needs to support removing collaborators
      // For now, we can filter and update the sharedWith array
      const updatedSharedWith = plan.sharedWith.filter(
        (share) => share.userId?._id !== userId
      );

      await updateStudyPlan(
        params.id,
        {
          sharedWith: updatedSharedWith.map((share) => ({
            userId: share.userId._id,
            role: share.role,
          })),
        },
        token
      );

      toast.success("Collaborator removed");
      await fetchPlanData();
    } catch (error) {
      console.error("Error removing collaborator:", error);
      toast.error("Failed to remove collaborator");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.shortDescription || !formData.courseCode) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        ...formData,
        resourceIds: resources.map((r) => r._id),
      };

      await updateStudyPlan(params.id, updateData, token);
      toast.success("Study plan updated successfully!");
      router.push(`/plans/${params.id}`);
    } catch (error) {
      console.error("Error updating study plan:", error);
      toast.error("Failed to update study plan");
    } finally {
      setSaving(false);
    }
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

  if (!plan || !user) {
    return null;
  }

  const creatorId = plan.createdBy?._id;
  const creatorFirebaseUid = plan.createdBy?.firebaseUid;
  const isCreator =
    (creatorFirebaseUid && creatorFirebaseUid === user.uid) ||
    (creatorId && user._id && creatorId === user._id);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href={`/plans/${params.id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Plan Details
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Edit Study Plan
          </h1>
          {isCreator && (
            <button
              type="button"
              onClick={() => setShowShareDialog(true)}
              className="inline-flex items-center justify-center rounded-md border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-all"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
          )}
        </div>

        {/* Share Dialog */}
        {showShareDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Share Study Plan
                </h3>
                <button
                  onClick={() => setShowShareDialog(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>

                <button
                  onClick={handleShare}
                  disabled={sharing || !shareEmail}
                  className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sharing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    "Share with Editor Access"
                  )}
                </button>

                {/* Current Collaborators */}
                {plan.sharedWith && plan.sharedWith.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      Current Collaborators
                    </h4>
                    <div className="space-y-2">
                      {plan.sharedWith.map((share) => (
                        <div
                          key={share.userId?._id}
                          className="flex items-center justify-between p-2 bg-muted/30 rounded-md"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {share.userId?.displayName ||
                                share.userId?.email?.split("@")[0]}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {share.userId?.email}
                            </p>
                          </div>
                          {isCreator && (
                            <button
                              onClick={() =>
                                handleRemoveCollaborator(share.userId._id)
                              }
                              className="text-destructive hover:text-destructive/80 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Basic Information
            </h2>

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., CS50 Midterm Preparation"
                required
                className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>

            <div>
              <label
                htmlFor="courseCode"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Course Code *
              </label>
              <input
                type="text"
                id="courseCode"
                name="courseCode"
                value={formData.courseCode}
                onChange={handleInputChange}
                placeholder="e.g., CSE110, EEE220, ECO101"
                required
                className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>

            <div>
              <label
                htmlFor="shortDescription"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Short Description *
              </label>
              <input
                type="text"
                id="shortDescription"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                placeholder="Brief description (1-2 lines)"
                required
                maxLength={150}
                className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.shortDescription.length}/150 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="fullDescription"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Full Description (Optional)
              </label>
              <textarea
                id="fullDescription"
                name="fullDescription"
                value={formData.fullDescription}
                onChange={handleInputChange}
                placeholder="Detailed description of what this study plan covers..."
                rows={4}
                className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary"
              />
              <label htmlFor="isPublic" className="text-sm text-foreground">
                Make this plan public (others can view and clone it)
              </label>
            </div>
          </div>

          {/* Add Resources */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Manage Resources
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Resource Type
                </label>
                <select
                  name="type"
                  value={resourceForm.type}
                  onChange={handleResourceFormChange}
                  className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="youtube-video">YouTube Video</option>
                  <option value="youtube-playlist">YouTube Playlist</option>
                  <option value="pdf">PDF Document</option>
                  <option value="article">Article/Blog Post</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  URL
                </label>
                <input
                  type="url"
                  name="url"
                  value={resourceForm.url}
                  onChange={handleResourceFormChange}
                  placeholder={
                    resourceForm.type.includes("youtube")
                      ? "https://www.youtube.com/watch?v=..."
                      : "https://example.com/resource"
                  }
                  className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              {(resourceForm.type === "pdf" ||
                resourceForm.type === "article") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={resourceForm.title}
                      onChange={handleResourceFormChange}
                      placeholder="Resource title"
                      className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />
                  </div>

                  {resourceForm.type === "pdf" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Number of Pages
                        </label>
                        <input
                          type="number"
                          name="pages"
                          value={resourceForm.pages}
                          onChange={handleResourceFormChange}
                          placeholder="50"
                          min="1"
                          className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Minutes per Page
                        </label>
                        <input
                          type="number"
                          name="minsPerPage"
                          value={resourceForm.minsPerPage}
                          onChange={handleResourceFormChange}
                          placeholder="3"
                          min="1"
                          className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Estimated Reading Time (minutes)
                      </label>
                      <input
                        type="number"
                        name="estimatedMins"
                        value={resourceForm.estimatedMins}
                        onChange={handleResourceFormChange}
                        placeholder="15"
                        min="1"
                        className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      />
                    </div>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={handleAddResource}
                disabled={addingResource || !resourceForm.url}
                className="w-full inline-flex items-center justify-center rounded-md border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingResource ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resource
                  </>
                )}
              </button>
            </div>

            {/* Resources List */}
            {resources.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-foreground">
                    Resources ({resources.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Drag to reorder • Click trash to remove
                  </p>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={resources.map((r) => r.localId)}
                    strategy={verticalListSortingStrategy}
                  >
                    {resources.map((resource, index) => (
                      <SortableResourceItem
                        key={resource.localId}
                        resource={resource}
                        index={index}
                        onRemove={() => handleRemoveResource(index)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
            {resources.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No resources added yet</p>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            <Link
              href={`/plans/${params.id}`}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-all"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
