import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Recipe, RecipeStep } from '../types'

export interface RecipeDetail {
  recipe: Recipe
  steps: RecipeStep[]
}

export function useRecipe(slug: string | undefined) {
  return useQuery({
    queryKey: ['recipe', slug],
    enabled: Boolean(slug),
    queryFn: async (): Promise<RecipeDetail> => {
      if (!slug) {
        throw new Error('Thiếu slug món để tải công thức')
      }

      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      if (recipeError) {
        throw recipeError
      }

      if (!recipe) {
        throw new Error('Không tìm thấy công thức')
      }

      const { data: steps, error: stepsError } = await supabase
        .from('recipe_steps')
        .select('*')
        .eq('recipe_id', recipe.id)
        .order('step_number')

      if (stepsError) {
        throw stepsError
      }

      return {
        recipe,
        steps: steps ?? [],
      }
    },
  })
}
