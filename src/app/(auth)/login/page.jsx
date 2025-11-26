"use client";

import AuthLayout from "@/components/layouts/AuthLayout";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/Auth/login-form";
import { toast, Toaster } from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import { useState, useEffect } from "react";

const Login = () => {
  const { signInUser, user, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSignIn = (email, password) => {
    setLoading(true);
    setError(null);
    signInUser(email, password)
      .then(() => {
        toast.success("Login successful!");
      })
      .catch((err) => {
        let errorMessage = "Login failed. Please try again.";

        // Provide user-friendly error messages
        if (err.code === "auth/user-not-found") {
          errorMessage = "No account found with this email.";
        } else if (err.code === "auth/wrong-password") {
          errorMessage = "Incorrect password.";
        } else if (err.code === "auth/invalid-email") {
          errorMessage = "Invalid email address.";
        } else if (err.code === "auth/user-disabled") {
          errorMessage = "This account has been disabled.";
        } else if (err.code === "auth/too-many-requests") {
          errorMessage = "Too many failed attempts. Please try again later.";
        } else if (err.code === "auth/invalid-credential") {
          errorMessage = "Invalid email or password.";
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        toast.error(errorMessage);
      })
      .finally(() => setLoading(false));
  };

  const handleSignInWithGoogle = () => {
    setLoading(true);
    setError(null);
    signInWithGoogle()
      .then(() => {
        toast.success("Login successful!");
      })
      .catch((err) => {
        let errorMessage = "Google sign-in failed. Please try again.";

        if (err.code === "auth/popup-closed-by-user") {
          errorMessage = "Sign-in cancelled.";
        } else if (err.code === "auth/popup-blocked") {
          errorMessage = "Popup was blocked. Please allow popups for this site.";
        } else if (err.code === "auth/account-exists-with-different-credential") {
          errorMessage = "An account already exists with this email.";
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        toast.error(errorMessage);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <>
      <AuthLayout imgSrc="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop">
        <LoginForm
          handleSignIn={handleSignIn}
          loading={loading}
          error={error}
          setError={setError}
          handleSignInWithGoogle={handleSignInWithGoogle}
        />
      </AuthLayout>
      <Toaster position="top-right" />
    </>
  );
};

export default Login;
