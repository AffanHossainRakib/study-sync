"use client";

import { useState, useEffect } from "react";
import AuthContext from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Sign in with email and password
  const signInUser = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Create user with email and password
  const createUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });
    return signInWithPopup(auth, provider)
      .then((result) => {
        console.log("Google sign-in successful:", result.user);
        return result;
      })
      .catch((error) => {
        console.error("Google sign-in error:", error);
        throw error;
      });
  };

  // Sign out
  const logOut = () => {
    return signOut(auth);
  };

  // Update user's full name
  const updateUsersFullName = (name) => {
    if (auth.currentUser) {
      return updateProfile(auth.currentUser, {
        displayName: name,
      });
    }
    return Promise.resolve();
  };

  // Update user's profile picture
  const updateUsersProfilePicture = (photoURL) => {
    if (auth.currentUser) {
      return updateProfile(auth.currentUser, {
        photoURL: photoURL,
      });
    }
    return Promise.resolve();
  };

  // Reset password
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Get ID token for API calls
        const idToken = await currentUser.getIdToken();
        setToken(idToken);

        // Fetch user profile from MongoDB to get role and other data
        try {
          const res = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${idToken}` },
          });

          if (res.ok) {
            const dbUser = await res.json();
            // Add MongoDB data to Firebase user object without losing Firebase methods
            Object.assign(currentUser, dbUser);
            setUser(currentUser);
          } else {
            console.error("Failed to fetch user profile from MongoDB");
            setUser(currentUser);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(currentUser);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const authInfo = {
    user,
    loading,
    token,
    signInUser,
    createUser,
    signInWithGoogle,
    logOut,
    updateUsersFullName,
    updateUsersProfilePicture,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};
