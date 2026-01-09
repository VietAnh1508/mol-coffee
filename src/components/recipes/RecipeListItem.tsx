import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { FaEdit, FaMugHot, FaTrash } from "react-icons/fa";
import { useDeleteRecipe, useToast } from "../../hooks";
import type { Recipe } from "../../types";
import { ConfirmationDialog } from "../ConfirmationDialog";

interface RecipeListItemProps {
  recipe: Recipe;
  canManage: boolean;
  onEdit: (recipe: Recipe) => void;
}

export function RecipeListItem({
  recipe,
  canManage,
  onEdit,
}: RecipeListItemProps) {
  const { showToast } = useToast();
  const deleteRecipeMutation = useDeleteRecipe();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleRequestDelete = () => {
    if (!canManage) return;
    setIsDeleteOpen(true);
  };

  const handleCancelDelete = () => {
    if (deleteRecipeMutation.isPending) return;
    setIsDeleteOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!canManage) {
      setIsDeleteOpen(false);
      return;
    }

    try {
      await deleteRecipeMutation.mutateAsync({
        id: recipe.id,
        slug: recipe.slug,
      });
      showToast(`Đã xóa công thức "${recipe.name}"`, "success");
      setIsDeleteOpen(false);
    } catch (mutationError) {
      console.error("Failed to delete recipe:", mutationError);
      showToast("Có lỗi xảy ra khi xóa công thức", "error");
    }
  };

  return (
    <div className="group flex h-full flex-col gap-4 rounded-2xl border border-subtle bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-black/10">
          <FaMugHot className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-primary transition-colors group-hover:text-blue-500">
            {recipe.name}
          </h2>
          <p className="text-sm text-subtle">
            {recipe.description || "Không có mô tả"}
          </p>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/recipes/$recipeSlug"
          params={{ recipeSlug: recipe.slug }}
          className="text-xs font-semibold uppercase tracking-wide text-blue-500 transition-colors hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          Xem chi tiết →
        </Link>
        {canManage && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(recipe)}
              className="flex items-center gap-1 rounded-lg border border-subtle px-3 py-1.5 text-xs font-semibold text-subtle transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
            >
              <FaEdit className="h-3 w-3" />
              Sửa
            </button>
            <button
              type="button"
              onClick={handleRequestDelete}
              className="flex items-center gap-1 rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-surface"
            >
              <FaTrash className="h-3 w-3" />
              Xóa
            </button>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa công thức"
        message={`Bạn có chắc chắn muốn xóa công thức "${recipe.name}" không?`}
        confirmText="Xóa"
        cancelText="Hủy"
        isLoading={deleteRecipeMutation.isPending}
        loadingText="Đang xóa..."
        actionType="danger"
      />
    </div>
  );
}
