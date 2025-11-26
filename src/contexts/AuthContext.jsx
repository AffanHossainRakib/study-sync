'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Get ID token for API calls
        const idToken = await firebaseUser.getIdToken();
        setToken(idToken);
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Register with email and password
  const register = async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }

      return { user: userCredential.user, error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { user: null, error: error.message };
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: error.message };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return { user: userCredential.user, error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { user: null, error: error.message };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setToken(null);
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error.message };
    }
  };

  // Refresh token
  const refreshToken = async () => {
    if (user) {
      try {
        const idToken = await user.getIdToken(true); // Force refresh
        setToken(idToken);
        return idToken;
      } catch (error) {
        console.error('Token refresh error:', error);
        return null;
      }
    }
    return null;
  };

  const value = {
    user,
    token,
    loading,
    register,
    signIn,
    signInWithGoogle,
    signOut,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
