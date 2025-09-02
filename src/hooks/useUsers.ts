import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { User } from "../types";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async (): Promise<User[]> => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - user data doesn't change very often
    retry: (failureCount, error) => {
      // Don't retry on permission/auth errors
      if (
        error?.message?.includes("permission") ||
        error?.message?.includes("auth")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useUser(userId: string | null) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async (): Promise<User> => {
      if (!userId) throw new Error("User ID is required");

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on permission/auth errors
      if (
        error?.message?.includes("permission") ||
        error?.message?.includes("auth")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
