import type {
  AuthError,
  Session,
  User as SupabaseUser,
} from "@supabase/supabase-js";
import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isPlaceholderPhone } from "../constants/userDefaults";
import { useUserProfile } from "../hooks";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./AuthContextDefinition";

// Re-export the context type for convenience
export type { AuthContextType } from "./AuthContextDefinition";

export function AuthProvider({ children }: PropsWithChildren) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const {
    data: user,
    isLoading: profileLoading,
    error: profileError,
  } = useUserProfile(supabaseUser?.id || null);

  const loading = authLoading || profileLoading;

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session check timeout")), 10000)
        );

        const result = await Promise.race([sessionPromise, timeoutPromise]);
        const {
          data: { session },
        } = result as { data: { session: Session | null } };

        if (session?.user) {
          setSupabaseUser(session.user);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
      } else {
        setSupabaseUser(null);
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Log profile errors for debugging
  useEffect(() => {
    if (profileError) {
      console.error("Error fetching user profile:", profileError);
    }
  }, [profileError]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      // Preserve AuthError type or create a compatible error with code property
      const authError =
        error instanceof Error ? error : new Error("Unknown error");
      return { error: authError as AuthError };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // No email confirmation needed
        },
      });

      if (error) return { error };

      return { error: null };
    } catch (error) {
      // Preserve AuthError type or create a compatible error with code property
      const authError =
        error instanceof Error ? error : new Error("Unknown error");
      return { error: authError as AuthError };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      // Clear local state immediately
      setSupabaseUser(null);

      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, []);

  const isProfileComplete = useCallback((userData: typeof user): boolean => {
    if (!userData) return false;
    // Check if name exists and phone is not a placeholder
    return Boolean(
      userData.name &&
        userData.name.trim() !== "" &&
        userData.phone &&
        !isPlaceholderPhone(userData.phone)
    );
  }, []);

  const value = useMemo(
    () => ({
      user: user || null,
      supabaseUser,
      loading,
      isProfileComplete: isProfileComplete(user),
      signIn,
      signUp,
      signOut,
    }),
    [user, supabaseUser, loading, isProfileComplete, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
