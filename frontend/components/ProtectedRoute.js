"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAuth } from "../store/hooks";
import { initializeAuth } from "../store/slices/authSlice";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    // Initialize auth from localStorage
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated && !token) {
      router.replace("/auth");
    }
  }, [router, isAuthenticated, token]);

  // Show loading or redirect while checking auth
  if (typeof window !== "undefined" && !isAuthenticated && !token) {
    return null;
  }

  return children;
} 