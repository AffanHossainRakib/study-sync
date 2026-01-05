"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Share2,
  Edit,
  Clock,
  FileText,
  Users,
  Youtube,
  ExternalLink,
  CheckCircle2,
  Loader2,
  X,
  Trash2,
  Mail,
  UserPlus,
  ArrowUpDown,
} from "lucide-react";
import {
  getStudyPlanById,
  createInstance,
  formatTime,
  getResourceTypeInfo,
  shareStudyPlan,
  removeSharedAccess,
} from "@/lib/api";
import useAuth from "@/hooks/useAuth";
import toast from "react-hot-toast";
import mixpanel from "@/lib/mixpanel";

export default function StudyPlanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingInstance, setCreatingInstance] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState("editor");
  const [sharing, setSharing] = useState(false);
  const [removingAccess, setRemovingAccess] = useState(null);
  const [sortBy, setSortBy] = useState("order");

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      console.log(
        "Fetching plan with ID:",
        params.id,
        "Length:",
        params.id?.length
      );
      const data = await getStudyPlanById(params.id, token, sortBy);
      setPlan(data);
    } catch (error) {
      console.error("Error fetching plan:", error);
      console.error("Plan ID:", params.id, "Length:", params.id?.length);
      toast.error(error.message || "Failed to load study plan");
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchPlanDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, token, sortBy]);

  const handleStartInstance = async () => {
    if (!user) {
      toast.error("Please login to start an instance");
      router.push("/login");
      return;
    }

    // Set default end date to 30 days from now
    const oneMonthLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    setEndDate(oneMonthLater);
    setShowStartDialog(true);
  };

  const handleConfirmStart = async () => {
    if (!endDate) {
      toast.error("Please select a target completion date");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (new Date(today) >= new Date(endDate)) {
      toast.error("Target date must be in the future");
      return;
    }

    try {
      setCreatingInstance(true);
      const result = await createInstance(
        {
          studyPlanId: params.id,
          startDate: today,
          endDate,
        },
        token
      );

      // Track start study plan event
      mixpanel.track("Start Study Plan", {
        plan_id: params.id,
        plan_title: plan?.title,
      });

      toast.success("Instance created successfully!");
      setShowStartDialog(false);
      router.push(`/instances/${result.instance._id}`);
    } catch (error) {
      console.error("Error creating instance:", error);
      toast.error("Failed to create instance");
    } finally {
      setCreatingInstance(false);
    }
  };

  const handleShare = async () => {
    if (!shareEmail) {
      toast.error("Please enter an email address");
      return;
    }

    // Basic email validation
    if (!shareEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setSharing(true);
      await shareStudyPlan(params.id, shareEmail, shareRole, token);

      // Track share event
      mixpanel.track("Share Study Plan", {
        plan_id: params.id,
        recipient_email: shareEmail,
        role: shareRole,
      });

      toast.success(`Study plan shared with ${shareEmail}`);
      setShareEmail("");
      setShareRole("editor");
      // Refresh plan data to show updated info
      await fetchPlanDetails();
    } catch (error) {
      console.error("Error sharing plan:", error);
      toast.error(error.message || "Failed to share study plan");
    } finally {
      setSharing(false);
    }
  };

  const handleRemoveAccess = async (email) => {
    if (!confirm(`Remove access for ${email}?`)) {
      return;
    }

    try {
      setRemovingAccess(email);
      await removeSharedAccess(params.id, email, token);
      toast.success(`Access removed for ${email}`);
      // Refresh plan data to show updated info
      await fetchPlanDetails();
    } catch (error) {
      console.error("Error removing access:", error);
      toast.error(error.message || "Failed to remove access");
    } finally {
      setRemovingAccess(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-8" />
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-4" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-full mb-2" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mb-8" />
            <div className="flex gap-4 mb-8">
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-32" />
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-16">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Study Plan Not Found
            </h1>
            <Link
              href="/plans"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-base font-medium text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Browse All Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/plans"
          className="inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to All Plans
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-900 rounded-2xl p-8 mb-6 shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-4 shadow-lg">
                {plan.courseCode}
              </span>
              <h1 className="text-4xl font-bold text-black dark:text-white bg-clip-text mb-3">
                {plan.courseCode} - {plan.title}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                {plan.shortDescription}
              </p>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium">
              <FileText className="h-4 w-4" />
              {plan.resourceCount || 0} resources
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-medium">
              <Clock className="h-4 w-4" />
              {formatTime(plan.totalTime)} total
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-medium">
              <Users className="h-4 w-4" />
              {plan.instanceCount || 0} started
            </div>
          </div>

          {/* Creator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
              {(plan.createdBy?.displayName || plan.createdBy?.email || "A")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Created by{" "}
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {plan.createdBy?.displayName ||
                  plan.createdBy?.email?.split("@")[0] ||
                  "Anonymous"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleStartInstance}
              disabled={creatingInstance}
              className="inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-3 text-base font-medium text-white shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {creatingInstance ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Start This Plan
                </>
              )}
            </button>

            {plan.canEdit && (
              <Link
                href={`/plans/${params.id}/edit`}
                className="inline-flex items-center justify-center rounded-xl bg-purple-600 px-6 py-3 text-base font-medium text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                onClick={(e) => {
                  console.log(
                    "Edit link clicked, navigating to:",
                    `/plans/${params.id}/edit`
                  );
                }}
              >
                <Edit className="h-5 w-5 mr-2" />
                Edit Plan
              </Link>
            )}

            {plan.canEdit && (
              <button
                onClick={() => setShowShareDialog(true)}
                className="inline-flex items-center justify-center rounded-xl border-2 border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 px-6 py-3 text-base font-medium text-blue-600 dark:text-blue-400 shadow-lg hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-400 dark:hover:border-blue-600 transition-all"
              >
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </button>
            )}
          </div>
        </div>

        {/* Share Dialog */}
        {showShareDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">
                  Share &ldquo;{plan.title}&rdquo;
                </h3>
                <button
                  onClick={() => setShowShareDialog(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Add People Section */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <UserPlus className="h-4 w-4" />
                  <span>Add people</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && shareEmail) {
                          handleShare();
                        }
                      }}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                      autoFocus
                    />
                  </div>
                  <select
                    value={shareRole}
                    onChange={(e) => setShareRole(e.target.value)}
                    className="px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                  <button
                    onClick={handleShare}
                    disabled={sharing || !shareEmail}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
                  >
                    {sharing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Share"
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Anyone with the link and appropriate permissions can access
                  this study plan. An invitation will be sent to the email
                  address.
                </p>
              </div>

              {/* People with Access Section */}
              <div className="border-t border-border pt-6">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-4">
                  <Users className="h-4 w-4" />
                  <span>People with access</span>
                </div>
                <div className="space-y-2">
                  {/* Creator */}
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {(plan.createdBy?.displayName ||
                            plan.createdBy?.email ||
                            "U")[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {plan.createdBy?.displayName ||
                            plan.createdBy?.email?.split("@")[0] ||
                            "Unknown"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {plan.createdBy?.email}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground px-3 py-1 bg-background rounded-md border border-border">
                      Owner
                    </span>
                  </div>

                  {/* Shared Users */}
                  {plan.sharedWith && plan.sharedWith.length > 0 ? (
                    plan.sharedWith.map((shared) => (
                      <div
                        key={shared.email}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Mail className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {shared.email}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Shared{" "}
                              {new Date(shared.sharedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-medium text-muted-foreground px-3 py-1 bg-background rounded-md border border-border capitalize">
                            {shared.role || "editor"}
                          </span>
                          <button
                            onClick={() => handleRemoveAccess(shared.email)}
                            disabled={removingAccess === shared.email}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
                            title="Remove access"
                          >
                            {removingAccess === shared.email ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Not shared with anyone yet
                    </p>
                  )}
                </div>
              </div>

              {/* Link Sharing Info */}
              <div className="mt-6 p-4 bg-muted/30 rounded-md">
                <div className="flex items-start gap-3">
                  <Share2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">
                      General access
                    </p>
                    <p>
                      Anyone with this link can view this study plan. Editors
                      can make changes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Description */}
        {plan.fullDescription && (
          <div className="bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-900 rounded-2xl p-6 mb-6 shadow-lg">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Description
            </h2>
            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
              {plan.fullDescription}
            </p>
          </div>
        )}

        {/* Resources List */}
        <div className="bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-900 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Resources ({plan.resourceIds?.length || 0})
            </h2>

            {plan.resourceIds && plan.resourceIds.length > 0 && (
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="order">Original Order</option>
                  <option value="title">Sort by Title</option>
                  <option value="duration">Sort by Duration</option>
                  <option value="type">Sort by Type</option>
                </select>
              </div>
            )}
          </div>

          {plan.resourceIds && plan.resourceIds.length > 0 ? (
            <div className="space-y-3">
              {plan.resourceIds.map((resource, index) => {
                const typeInfo = getResourceTypeInfo(resource.type);
                const Icon = typeInfo.icon === "Youtube" ? Youtube : FileText;
                const totalTime =
                  resource.type === "youtube-video"
                    ? resource.metadata?.duration
                    : resource.type === "pdf"
                    ? (resource.metadata?.pages || 0) *
                      (resource.metadata?.minsPerPage || 0)
                    : resource.type === "article" ||
                      resource.type === "google-drive" ||
                      resource.type === "custom-link"
                    ? resource.metadata?.estimatedMins || 0
                    : 0;

                return (
                  <div
                    key={resource._id}
                    className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-800 rounded-xl transition-all"
                  >
                    <div className="shrink-0">
                      <div
                        className={`p-2.5 rounded-xl shadow-md ${
                          resource.type === "youtube-video"
                            ? "bg-gradient-to-br from-red-500 to-red-600"
                            : resource.type === "pdf"
                            ? "bg-gradient-to-br from-blue-500 to-blue-600"
                            : "bg-gradient-to-br from-green-500 to-green-600"
                        }`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                            {index + 1}. {resource.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold ${
                                resource.type === "youtube-video"
                                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                  : resource.type === "pdf"
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                  : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              }`}
                            >
                              {typeInfo.label}
                            </span>
                            <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                              <Clock className="h-3.5 w-3.5" />
                              {formatTime(totalTime)}
                            </span>
                          </div>
                        </div>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors transform hover:scale-110"
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
              No resources added yet.
            </p>
          )}
        </div>

        {/* Last Modified Info */}
        {plan.lastModifiedBy && (
          <div className="mt-6 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-400 text-center">
            Last modified by{" "}
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {plan.lastModifiedBy?.displayName ||
                plan.lastModifiedBy?.email?.split("@")[0]}
            </span>{" "}
            on {new Date(plan.lastModifiedAt).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Start Plan Dialog */}
      {showStartDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-900 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Start Study Plan
                </h3>
                <button
                  onClick={() => setShowStartDialog(false)}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Set your target completion date for this study plan. You can
                always adjust it later.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowStartDialog(false)}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium"
                  disabled={creatingInstance}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStart}
                  disabled={creatingInstance || !endDate}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
                >
                  {creatingInstance ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    "Start Plan"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
