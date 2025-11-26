"use client";

import React, { useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const MyStudyPlan = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render content if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Study Plans</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Welcome, {user.displayName || user.email}!
        </p>
        <p className="mt-4">Your study plans will appear here.</p>
      </div>
    </div>
  );
};

export default MyStudyPlan;
