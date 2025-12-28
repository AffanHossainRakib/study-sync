"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Share2, X } from "lucide-react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import {
  getStudyPlanById,
  updateStudyPlan,
  createOrGetResource,
  shareStudyPlan,
} from "@/lib/api";
import toast from "react-hot-toast";
import BasicInfoForm from "@/app/create-plan/components/BasicInfoForm";
import AddResourceForm from "@/app/create-plan/components/AddResourceForm";
import ResourceList from "@/app/create-plan/components/ResourceList";

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
      } else if (
        resourceForm.type === "google-drive" ||
        resourceForm.type === "custom-link"
      ) {
        // For google-drive and custom-link, store the link with optional title and estimatedMins
        if (resourceForm.title) {
          resourceData.title = resourceForm.title;
        }
        if (resourceForm.estimatedMins) {
          resourceData.estimatedMins = parseInt(resourceForm.estimatedMins);
        }
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
      await shareStudyPlan(params.id, shareEmail, "editor", token);
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
          <BasicInfoForm formData={formData} onChange={handleInputChange} />

          <AddResourceForm
            resourceForm={resourceForm}
            onChange={handleResourceFormChange}
            onAdd={handleAddResource}
            isAdding={addingResource}
          />

          <ResourceList
            resources={resources}
            onReorder={setResources}
            onRemove={handleRemoveResource}
          />

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
