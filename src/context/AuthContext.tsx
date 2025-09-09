import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useUserProfile } from "../hooks";
import { AuthContext } from "./AuthContextDefinition";

// Re-export the context type for convenience
export type { AuthContextType } from "./AuthContextDefinition";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const { data: user, isLoading: profileLoading, error: profileError } = useUserProfile(
    supabaseUser?.id || null
  );

  const loading = authLoading || profileLoading;

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session check timeout')), 10000)
        );

        const result = await Promise.race([sessionPromise, timeoutPromise]);
        const { data: { session } } = result as { data: { session: Session | null } };
        
        if (session?.user) {
          setSupabaseUser(session.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
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

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name, // Pass name to trigger via user metadata
          },
          emailRedirectTo: undefined, // No email confirmation needed
        },
      });

      if (error) return { error };

      // User profile will be created automatically by the handle_new_user trigger
      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  };

  const signOut = async () => {
    try {
      // Clear local state immediately  
      setSupabaseUser(null);

      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = useMemo(() => ({
    user: user || null,
    supabaseUser,
    loading,
    signIn,
    signUp,
    signOut,
  }), [user, supabaseUser, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
