import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { FaMugHot } from "react-icons/fa";
import { PageTitle } from "../components/PageTitle";
import { Spinner } from "../components/Spinner";
import { useRecipes, useToast } from "../hooks";

export function RecipeListPage() {
  const { data: recipes = [], isLoading, error } = useRecipes();
  const { showToast } = useToast();

  useEffect(() => {
    if (!error) return;
    console.error("Failed to load recipes", error);
    showToast("Không thể tải danh sách công thức. Vui lòng thử lại.", "error");
  }, [error, showToast]);

  const hasRecipes = recipes.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <PageTitle title="Công thức pha chế" />
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
            <Link
              key={recipe.id}
              to="/recipes/$recipeSlug"
              params={{ recipeSlug: recipe.slug }}
              className="group flex h-full flex-col gap-4 rounded-2xl border border-subtle bg-surface p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
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
              <span className="text-xs font-semibold uppercase tracking-wide text-blue-500 transition-colors group-hover:text-blue-400">
                Xem chi tiết →
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-subtle bg-surface px-6 py-10 text-center text-sm text-subtle shadow-sm">
          Chưa có công thức nào. Vui lòng liên hệ quản trị viên để thêm dữ liệu.
        </div>
      )}
    </div>
  );
}
