import { useEffect, useState } from "react";
import { HiPlus } from "react-icons/hi2";
import { PageTitle } from "../components/PageTitle";
import { Spinner } from "../components/Spinner";
import { RecipeFormDialog } from "../components/recipes/RecipeFormDialog";
import { RecipeListItem } from "../components/recipes/RecipeListItem";
import { isAdmin } from "../constants/userRoles";
import {
  useAuth,
  useCreateRecipe,
  useRecipe,
  useRecipes,
  useToast,
  useUpdateRecipe,
} from "../hooks";
import type { Recipe } from "../types";

export function RecipeListPage() {
  const { data: recipes = [], isLoading, error } = useRecipes();
  const { showToast } = useToast();
  const { user } = useAuth();
  const canManage = isAdmin(user?.role);
  const createRecipeMutation = useCreateRecipe();
  const updateRecipeMutation = useUpdateRecipe();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const {
    data: activeRecipeDetail,
    isLoading: isRecipeDetailLoading,
    error: recipeDetailError,
  } = useRecipe(editingRecipe?.slug);

  useEffect(() => {
    if (!error) return;
    console.error("Failed to load recipes", error);
    showToast("Không thể tải danh sách công thức. Vui lòng thử lại.", "error");
  }, [error, showToast]);

  useEffect(() => {
    if (!recipeDetailError) return;
    console.error("Failed to load recipe detail", recipeDetailError);
    showToast("Không thể tải chi tiết công thức. Vui lòng thử lại.", "error");
    setIsFormOpen(false);
    setEditingRecipe(null);
  }, [recipeDetailError, showToast]);

  const hasRecipes = recipes.length > 0;
  const isSubmitting =
    createRecipeMutation.isPending || updateRecipeMutation.isPending;

  const handleCreate = () => {
    if (!canManage) return;
    setEditingRecipe(null);
    setIsFormOpen(true);
  };

  const handleEdit = (recipe: Recipe) => {
    if (!canManage) return;
    setEditingRecipe(recipe);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    if (isSubmitting) return;
    setIsFormOpen(false);
    setEditingRecipe(null);
  };

  const handleSubmitForm = async (values: {
    name: string;
    description: string | null;
    steps: string[];
  }) => {
    if (!canManage) return;

    try {
      if (editingRecipe) {
        await updateRecipeMutation.mutateAsync({
          id: editingRecipe.id,
          slug: editingRecipe.slug,
          ...values,
        });
        showToast("Cập nhật công thức thành công", "success");
      } else {
        await createRecipeMutation.mutateAsync(values);
        showToast("Đã tạo công thức mới", "success");
      }

      setIsFormOpen(false);
      setEditingRecipe(null);
    } catch (mutationError) {
      console.error("Failed to save recipe:", mutationError);
      showToast("Có lỗi xảy ra khi lưu công thức", "error");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="Công thức pha chế" />
        {canManage && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
          >
            <HiPlus className="h-4 w-4" />
            Tạo mới
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-6 py-5 text-sm text-rose-300 shadow-sm">
          Không thể tải dữ liệu công thức. Vui lòng thử lại sau.
        </div>
      ) : hasRecipes ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {recipes.map((recipe) => (
            <RecipeListItem
              key={recipe.id}
              recipe={recipe}
              canManage={canManage}
              onEdit={handleEdit}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-subtle bg-surface px-6 py-10 text-center text-sm text-subtle shadow-sm">
          {canManage
            ? "Chưa có công thức nào. Hãy tạo mới để bắt đầu."
            : "Chưa có công thức nào. Vui lòng liên hệ quản trị viên để thêm dữ liệu."}
        </div>
      )}

      <RecipeFormDialog
        isOpen={isFormOpen}
        isLoading={Boolean(editingRecipe && isRecipeDetailLoading)}
        isSubmitting={isSubmitting}
        recipe={activeRecipeDetail?.recipe ?? editingRecipe}
        steps={activeRecipeDetail?.steps}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
}
