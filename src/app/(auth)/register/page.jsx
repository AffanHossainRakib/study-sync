"use client";

import AuthLayout from "@/components/layouts/AuthLayout";
import SignupForm from "@/components/Auth/signup-from";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import useAuth from "@/hooks/useAuth";

const Signup = () => {
  const { user, createUser, updateUsersFullName, updateUsersProfilePicture } =
    useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSignup = (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    // Validate inputs
    if (!name || !email || !password || !profilePicture) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      setLoading(false);
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter.");
      setLoading(false);
      return;
    }

    // Validate URL format for profile picture
    try {
      new URL(profilePicture);
    } catch {
      setError("Please enter a valid URL for the profile picture.");
      setLoading(false);
      return;
    }

    createUser(email, password)
      .then(() => {
        updateUsersFullName(name);
        updateUsersProfilePicture(profilePicture);
        toast.success("Account created successfully!");
        router.push("/");
      })
      .catch((err) => {
        const errorMessage = err.message || "Failed to create account.";
        setError(errorMessage);
        toast.error(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <>
      <AuthLayout imgSrc="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop">
        <SignupForm
          setName={setName}
          setEmail={setEmail}
          setPassword={setPassword}
          setProfilePicture={setProfilePicture}
          handleSignup={handleSignup}
          loading={loading}
          error={error}
          setError={setError}
        />
      </AuthLayout>
      <Toaster position="top-right" />
    </>
  );
};

export default Signup;
