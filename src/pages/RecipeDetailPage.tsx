import { useEffect } from "react";
import { BackLink } from "../components/common/BackLink";
import { PageTitle } from "../components/PageTitle";
import { Spinner } from "../components/Spinner";
import { useRecipe, useToast } from "../hooks";

interface RecipeDetailPageProps {
  slug: string;
}

export function RecipeDetailPage({ slug }: RecipeDetailPageProps) {
  const { data, isLoading, error } = useRecipe(slug);
  const { showToast } = useToast();

  useEffect(() => {
    if (!error) return;
    console.error("Failed to load recipe detail", error);
    showToast("Không thể tải chi tiết công thức. Vui lòng thử lại.", "error");
  }, [error, showToast]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-6 py-5 text-sm text-rose-300 shadow-sm">
          Không tìm thấy công thức hoặc đã bị xóa.
        </div>
        <BackLink to="/recipes" label="Trở về danh sách" className="mt-6" />
      </div>
    );
  }

  const { recipe, steps } = data;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <BackLink to="/recipes" label="Quay lại danh sách" />
      </div>

      <PageTitle title={recipe.name} />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-primary">
          Các bước thực hiện
        </h2>
        {steps.length > 0 ? (
          <ol className="space-y-3">
            {steps.map((step) => (
              <li
                key={step.id}
                className="rounded-2xl border border-subtle bg-surface px-5 py-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white shadow-sm">
                    {step.step_number}
                  </span>
                  <p className="text-sm leading-relaxed text-primary">
                    {step.instruction}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="rounded-2xl border border-subtle bg-surface px-5 py-6 text-sm text-subtle shadow-sm">
            Chưa có bước pha chế nào được lưu cho công thức này.
          </div>
        )}
      </section>
    </div>
  );
}
