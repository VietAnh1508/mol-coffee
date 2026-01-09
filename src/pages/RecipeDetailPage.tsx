import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { BackLink } from "../components/common/BackLink";
import { PageTitle } from "../components/PageTitle";
import { Spinner } from "../components/Spinner";
import { isAdmin } from "../constants/userRoles";
import { useAuth, useRecipe, useToast, useUpdateRecipeStep } from "../hooks";

interface RecipeDetailPageProps {
  slug: string;
}

export function RecipeDetailPage({ slug }: RecipeDetailPageProps) {
  const { data, isLoading, error } = useRecipe(slug);
  const { showToast } = useToast();
  const { user } = useAuth();
  const canManage = isAdmin(user?.role);
  const updateRecipeStepMutation = useUpdateRecipeStep();
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [draftInstruction, setDraftInstruction] = useState("");

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

  const isUpdatingStep = updateRecipeStepMutation.isPending;

  const handleStartEditStep = (id: string, instruction: string) => {
    if (!canManage) return;
    setEditingStepId(id);
    setDraftInstruction(instruction);
  };

  const handleCancelEditStep = () => {
    if (isUpdatingStep) return;
    setEditingStepId(null);
    setDraftInstruction("");
  };

  const handleSaveStep = async (id: string) => {
    if (!canManage) return;
    try {
      await updateRecipeStepMutation.mutateAsync({
        id,
        instruction: draftInstruction,
        recipeSlug: recipe.slug,
      });
      showToast("Đã cập nhật bước công thức", "success");
      setEditingStepId(null);
      setDraftInstruction("");
    } catch (mutationError) {
      console.error("Failed to update recipe step:", mutationError);
      showToast("Có lỗi xảy ra khi cập nhật bước công thức", "error");
    }
  };

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
                  <div className="flex-1 space-y-3">
                    {editingStepId === step.id ? (
                      <div className="space-y-3">
                        <textarea
                          rows={3}
                          value={draftInstruction}
                          onChange={(event) =>
                            setDraftInstruction(event.target.value)
                          }
                          className="w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm text-primary placeholder-subtle shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveStep(step.id)}
                            disabled={isUpdatingStep}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isUpdatingStep ? "Đang lưu..." : "Lưu"}
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEditStep}
                            disabled={isUpdatingStep}
                            className="rounded-lg border border-subtle px-3 py-1.5 text-xs font-semibold text-subtle transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm leading-relaxed text-primary">
                          {step.instruction}
                        </p>
                        {canManage && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStartEditStep(step.id, step.instruction)
                            }
                            className="shrink-0 rounded-md p-1 text-muted transition hover:bg-surface-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
                            aria-label="Sửa bước công thức"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
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
