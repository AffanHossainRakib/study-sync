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
} from "lucide-react";
import {
  getStudyPlanById,
  createInstance,
  formatTime,
  getResourceTypeInfo,
} from "@/lib/api";
import useAuth from "@/hooks/useAuth";
import toast from "react-hot-toast";

export default function StudyPlanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingInstance, setCreatingInstance] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPlanDetails();
    }
  }, [params.id, token]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      console.log(
        "Fetching plan with ID:",
        params.id,
        "Length:",
        params.id?.length
      );
      const data = await getStudyPlanById(params.id, token);
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

  const handleStartInstance = async () => {
    if (!user) {
      toast.error("Please login to start an instance");
      router.push("/login");
      return;
    }

    try {
      setCreatingInstance(true);
      const result = await createInstance({ studyPlanId: params.id }, token);
      toast.success("Instance created successfully!");
      router.push(`/instances/${result.instance._id}`);
    } catch (error) {
      console.error("Error creating instance:", error);
      toast.error("Failed to create instance");
    } finally {
      setCreatingInstance(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8" />
            <div className="h-10 bg-muted rounded w-3/4 mb-4" />
            <div className="h-6 bg-muted rounded w-full mb-2" />
            <div className="h-6 bg-muted rounded w-2/3 mb-8" />
            <div className="flex gap-4 mb-8">
              <div className="h-10 bg-muted rounded w-32" />
              <div className="h-10 bg-muted rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Study Plan Not Found
          </h1>
          <Link href="/plans" className="text-primary hover:underline">
            Browse All Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/plans"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to All Plans
        </Link>

        {/* Header */}
        <div className="bg-card border border-border rounded-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-primary/10 text-primary mb-3">
                {plan.courseCode}
              </span>
              <h1 className="text-3xl font-bold text-foreground mb-3">
                {plan.courseCode} - {plan.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {plan.shortDescription}
              </p>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              {plan.resourceCount || 0} resources
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {formatTime(plan.totalTime)} total
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {plan.instanceCount || 0} instances started
            </div>
          </div>

          {/* Creator */}
          <div className="text-sm text-muted-foreground mb-6">
            Created by{" "}
            <span className="font-medium text-foreground">
              {plan.createdBy?.displayName ||
                plan.createdBy?.email?.split("@")[0] ||
                "Anonymous"}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleStartInstance}
              disabled={creatingInstance || !user}
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-5 w-5 mr-2" />
              {creatingInstance ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Start This Plan"
              )}
            </button>

            {plan.canEdit && (
              <Link
                href={`/plans/${params.id}/edit`}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Edit className="h-5 w-5 mr-2" />
                Edit Plan
              </Link>
            )}

            {plan.canEdit && (
              <button className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-base font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-all">
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </button>
            )}
          </div>
        </div>

        {/* Full Description */}
        {plan.fullDescription && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Description
            </h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {plan.fullDescription}
            </p>
          </div>
        )}

        {/* Resources List */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Resources ({plan.resourceIds?.length || 0})
          </h2>

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
                      : resource.metadata?.estimatedMins || 0;

                return (
                  <div
                    key={resource._id}
                    className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`p-2 rounded-md ${
                          resource.type === "youtube-video"
                            ? "bg-red-100 dark:bg-red-900/20"
                            : resource.type === "pdf"
                              ? "bg-blue-100 dark:bg-blue-900/20"
                              : "bg-green-100 dark:bg-green-900/20"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            resource.type === "youtube-video"
                              ? "text-red-600 dark:text-red-400"
                              : resource.type === "pdf"
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-green-600 dark:text-green-400"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-foreground mb-1 line-clamp-2">
                            {index + 1}. {resource.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-background border border-border">
                              {typeInfo.label}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(totalTime)}
                            </span>
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
              No resources added yet.
            </p>
          )}
        </div>

        {/* Last Modified Info */}
        {plan.lastModifiedBy && (
          <div className="mt-6 text-sm text-muted-foreground text-center">
            Last modified by{" "}
            {plan.lastModifiedBy?.displayName ||
              plan.lastModifiedBy?.email?.split("@")[0]}{" "}
            on {new Date(plan.lastModifiedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
