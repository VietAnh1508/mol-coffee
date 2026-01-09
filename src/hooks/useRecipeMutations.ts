import type { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAdmin } from "../constants/userRoles";
import { supabase } from "../lib/supabase";
import type { Recipe } from "../types";
import { useAuth } from "./useAuth";

export interface RecipeFormInput {
  name: string;
  description?: string | null;
  steps: string[];
}

interface RecipeUpdateInput extends RecipeFormInput {
  id: string;
  slug?: string;
}

interface RecipeDeleteInput {
  id: string;
  slug?: string;
}

interface RecipeStepUpdateInput {
  id: string;
  instruction: string;
  recipeSlug?: string;
}

const slugify = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const normalizeSteps = (steps: string[]): string[] =>
  steps.map((step) => step.trim()).filter(Boolean);

const upsertSteps = async (recipeId: string, steps: string[]) => {
  const normalizedSteps = normalizeSteps(steps);

  if (normalizedSteps.length === 0) {
    throw new Error("Vui lòng nhập ít nhất một bước pha chế");
  }

  const { error: deleteError } = await supabase
    .from("recipe_steps")
    .delete()
    .eq("recipe_id", recipeId);

  if (deleteError) {
    throw deleteError;
  }

  const { error: insertError } = await supabase.from("recipe_steps").insert(
    normalizedSteps.map((instruction, index) => ({
      recipe_id: recipeId,
      step_number: index + 1,
      instruction,
    }))
  );

  if (insertError) {
    throw insertError;
  }
};

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: RecipeFormInput): Promise<Recipe> => {
      if (!isAdmin(user?.role)) {
        throw new Error("Bạn không có quyền tạo công thức");
      }

      const name = data.name.trim();
      const description = data.description?.trim() || null;
      const baseSlug = slugify(name);

      if (!baseSlug) {
        throw new Error("Tên công thức không hợp lệ");
      }

      const attemptInsert = async (slug: string) => {
        const { data: recipe, error } = await supabase
          .from("recipes")
          .insert({
            slug,
            name,
            description,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        return recipe;
      };

      let recipe: Recipe;
      try {
        recipe = await attemptInsert(baseSlug);
      } catch (error: unknown) {
        const postgrestError =
          error && typeof error === "object" && "code" in error
            ? (error as PostgrestError)
            : null;
        if (postgrestError?.code === "23505") {
          // unique_violation
          const fallbackSlug = `${baseSlug}-${Math.random()
            .toString(36)
            .slice(2, 6)}`;
          recipe = await attemptInsert(fallbackSlug);
        } else {
          throw error;
        }
      }

      try {
        await upsertSteps(recipe.id, data.steps);
      } catch (error) {
        await supabase.from("recipes").delete().eq("id", recipe.id);
        throw error;
      }

      return recipe;
    },
    onMutate: async (data) => {
      if (!isAdmin(user?.role)) {
        return {};
      }

      const previousRecipes =
        queryClient.getQueryData<Recipe[]>(["recipes"]) ?? [];
      const optimisticRecipe: Recipe = {
        id: `temp-${Date.now()}`,
        slug: slugify(data.name),
        name: data.name.trim(),
        description: data.description?.trim() || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Recipe[]>(["recipes"], (current = []) => {
        const next = [optimisticRecipe, ...current];
        return [...next].sort((a, b) => a.name.localeCompare(b.name));
      });

      return { previousRecipes };
    },
    onError: (_error, _data, context) => {
      if (context?.previousRecipes) {
        queryClient.setQueryData(["recipes"], context.previousRecipes);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: RecipeUpdateInput): Promise<Recipe> => {
      if (!isAdmin(user?.role)) {
        throw new Error("Bạn không có quyền cập nhật công thức");
      }

      const name = data.name.trim();
      const description = data.description?.trim() || null;

      const { data: recipe, error } = await supabase
        .from("recipes")
        .update({ name, description })
        .eq("id", data.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      await upsertSteps(recipe.id, data.steps);

      return recipe;
    },
    onMutate: async (data) => {
      if (!isAdmin(user?.role)) {
        return {};
      }

      const previousRecipes =
        queryClient.getQueryData<Recipe[]>(["recipes"]) ?? [];

      queryClient.setQueryData<Recipe[]>(["recipes"], (current = []) =>
        current.map((recipe) =>
          recipe.id === data.id
            ? {
                ...recipe,
                name: data.name.trim(),
                description: data.description?.trim() || null,
                updated_at: new Date().toISOString(),
              }
            : recipe
        )
      );

      return { previousRecipes };
    },
    onError: (_error, _data, context) => {
      if (context?.previousRecipes) {
        queryClient.setQueryData(["recipes"], context.previousRecipes);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      if (variables.slug) {
        queryClient.invalidateQueries({ queryKey: ["recipe", variables.slug] });
      }
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: RecipeDeleteInput): Promise<void> => {
      if (!isAdmin(user?.role)) {
        throw new Error("Bạn không có quyền xóa công thức");
      }

      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", data.id);

      if (error) {
        throw error;
      }
    },
    onMutate: async (data) => {
      if (!isAdmin(user?.role)) {
        return {};
      }

      const previousRecipes =
        queryClient.getQueryData<Recipe[]>(["recipes"]) ?? [];

      queryClient.setQueryData<Recipe[]>(["recipes"], (current = []) =>
        current.filter((recipe) => recipe.id !== data.id)
      );

      return { previousRecipes };
    },
    onError: (_error, _data, context) => {
      if (context?.previousRecipes) {
        queryClient.setQueryData(["recipes"], context.previousRecipes);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      if (variables.slug) {
        queryClient.invalidateQueries({ queryKey: ["recipe", variables.slug] });
      }
    },
  });
}

export function useUpdateRecipeStep() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: RecipeStepUpdateInput): Promise<void> => {
      if (!isAdmin(user?.role)) {
        throw new Error("Bạn không có quyền cập nhật bước công thức");
      }

      const instruction = data.instruction.trim();
      if (!instruction) {
        throw new Error("Nội dung bước không được để trống");
      }

      const { error } = await supabase
        .from("recipe_steps")
        .update({ instruction })
        .eq("id", data.id);

      if (error) {
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      if (variables.recipeSlug) {
        queryClient.invalidateQueries({
          queryKey: ["recipe", variables.recipeSlug],
        });
      }
    },
  });
}
