"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Edit2,
  Save,
  X,
  Camera,
  Loader2,
  Shield,
  FolderOpen,
  Play,
  Clock,
  FileText,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { fadeInUp } from "@/lib/animations";
import { getStudyPlans, getInstances, formatTime } from "@/lib/api";

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Plans and Instances data
  const [plans, setPlans] = useState([]);
  const [instances, setInstances] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }

    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
      fetchUserData();
    }
  }, [user, authLoading, router]);

  const fetchUserData = async () => {
    try {
      setLoadingData(true);

      // Fetch plans and instances in parallel
      const [plansData, instancesData] = await Promise.all([
        getStudyPlans({ view: "my", sort: "newest" }),
        getInstances(),
      ]);

      setPlans((plansData.plans || []).slice(0, 3)); // Show only 3 recent plans
      setInstances((instancesData.instances || []).slice(0, 3)); // Show only 3 recent instances
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const updates = {};
      if (displayName !== user.displayName) updates.displayName = displayName;
      if (photoURL !== user.photoURL) updates.photoURL = photoURL;

      if (Object.keys(updates).length > 0) {
        await updateProfile(auth.currentUser, updates);
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }

      setIsEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(user?.displayName || "");
    setPhotoURL(user?.photoURL || "");
    setIsEditing(false);
    setError("");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const createdAt = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  return (
    <div className="min-h-screen bg-background py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              My Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your account information and preferences
            </p>
          </div>

          {/* Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm"
            >
              {success}
            </motion.div>
          )}

          {/* Profile Card */}
          <motion.div
            variants={fadeInUp}
            className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Header with gradient */}
            <div className="h-32 bg-gradient-to-r from-primary via-purple-500 to-pink-500 relative">
              <div className="absolute -bottom-16 left-6 sm:left-8">
                <div className="relative">
                  {isEditing ? (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-muted border-4 border-card flex items-center justify-center">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : photoURL ? (
                    <img
                      src={photoURL}
                      alt={displayName || "User"}
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-card shadow-xl"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  {!isEditing && (
                    <div
                      className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center border-4 border-card shadow-xl ${
                        photoURL ? "hidden" : ""
                      }`}
                    >
                      <User className="h-12 w-12 sm:h-14 sm:w-14 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <div className="absolute top-4 right-4 sm:right-6">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-card/90 backdrop-blur-sm text-foreground rounded-lg shadow-lg hover:bg-white dark:hover:bg-card transition-all duration-300 hover:scale-105"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-card/90 backdrop-blur-sm text-foreground rounded-lg shadow-lg hover:bg-white dark:hover:bg-card transition-all duration-300 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      <span className="hidden sm:inline">Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">
                        {isSaving ? "Saving..." : "Save"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="pt-20 sm:pt-24 p-6 sm:p-8 space-y-6">
              {/* Display Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <User className="h-4 w-4" />
                  Display Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-semibold text-foreground">
                    {user.displayName || "Not set"}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <p className="text-lg text-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Photo URL */}
              {isEditing && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                    <Camera className="h-4 w-4" />
                    Profile Photo URL
                  </label>
                  <input
                    type="url"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder="Enter image URL"
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a valid image URL for your profile picture
                  </p>
                </div>
              )}

              {/* Account Info */}
              <div className="pt-6 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Member since</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {createdAt}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Account Status</span>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* My Plans Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <FolderOpen className="h-6 w-6" />
                My Study Plans
              </h2>
              <Link
                href="/my-plans"
                className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {loadingData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-card border border-border rounded-xl p-4 animate-pulse"
                  >
                    <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                    <div className="h-3 bg-muted rounded w-full mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : plans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <Link
                    key={plan._id}
                    href={`/plans/${plan._id}`}
                    className="group bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {plan.courseCode}
                      </span>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {plan.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {plan.resourceCount || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(plan.totalTime)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No study plans yet</p>
                <Link
                  href="/create-plan"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Your First Plan
                </Link>
              </div>
            )}
          </motion.div>

          {/* My Instances Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <Play className="h-6 w-6" />
                My Instances
              </h2>
              <Link
                href="/instances"
                className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {loadingData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-card border border-border rounded-xl p-4 animate-pulse"
                  >
                    <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                    <div className="h-3 bg-muted rounded w-full mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : instances.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {instances.map((instance) => (
                  <Link
                    key={instance._id}
                    href={`/instances/${instance._id}`}
                    className="group bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                        Active
                      </span>
                      <Play className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {instance.studyPlan?.title || "Unnamed Instance"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${instance.progress || 0}%` }}
                        />
                      </div>
                      <span className="font-medium">
                        {Math.round(instance.progress || 0)}%
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <Play className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  No active instances
                </p>
                <Link
                  href="/plans"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Browse Study Plans
                </Link>
              </div>
            )}
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 p-4 bg-muted/30 border border-border rounded-xl"
          >
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Your profile information is used across
              StudySync to personalize your experience. Changes will be
              reflected immediately.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
