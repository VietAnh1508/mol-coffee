import type { AuthError, User as SupabaseUser } from "@supabase/supabase-js";
import { createContext } from "react";
import type { User } from "../types";

export interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  isProfileComplete: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (
    email: string,
    redirectTo: string
  ) => Promise<{ error: AuthError | null }>;
  resetPassword: (
    newPassword: string
  ) => Promise<{ error: AuthError | null }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
