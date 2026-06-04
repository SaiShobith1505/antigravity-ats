"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { auth } from "./firebase";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";

interface UserType {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Sync session state from localStorage first for sandboxing robustness
    const savedUser = localStorage.getItem("cv_boost_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setLoading(false);
        return;
      } catch (_) {}
    }

    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const userObj = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Student Candidate",
            photoURL: fbUser.photoURL,
          };
          setUser(userObj);
          localStorage.setItem("cv_boost_user", JSON.stringify(userObj));
        } else {
          // If no custom mock session exists, sync null
          const mockActive = localStorage.getItem("cv_boost_user");
          if (!mockActive) {
            setUser(null);
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    if (auth) {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        const userObj = {
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName || "Google Candidate",
          photoURL: res.user.photoURL,
        };
        setUser(userObj);
        localStorage.setItem("cv_boost_user", JSON.stringify(userObj));
      }
    } else {
      throw new Error("Google Sign-In failed. Firebase auth is not configured.");
    }
  };

  const signInWithEmail = async (email: string, password?: string) => {
    // 1. Custom hardcoded Admin bypass validator
    if (email === "admin@cvboost.co" && password === "AntigravityAdmin2026") {
      const adminUser = {
        uid: "admin-uid-999",
        email: "admin@cvboost.co",
        displayName: "BOOSTCV Admin 👑",
      };
      setUser(adminUser);
      localStorage.setItem("cv_boost_user", JSON.stringify(adminUser));
      return;
    }

    // 2. Regular standard credentials workflow
    if (auth) {
      await signInWithEmailAndPassword(auth, email, password || "");
    } else {
      throw new Error("Authentication failed. Email and password verification requires active database configurations.");
    }
  };

  const signOut = async () => {
    try {
      if (auth) {
        await fbSignOut(auth);
      }
    } catch (error) {
      console.warn("Firebase signout failed:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("cv_boost_user");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);