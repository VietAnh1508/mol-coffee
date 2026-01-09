import { useEffect, useState, type FormEvent } from "react";
import type { Recipe, RecipeStep } from "../../types";
import { Spinner } from "../Spinner";

export interface RecipeFormValues {
  name: string;
  description: string | null;
  steps: string[];
}

interface RecipeFormDialogProps {
  isOpen: boolean;
  isLoading?: boolean;
  isSubmitting?: boolean;
  recipe?: Recipe | null;
  steps?: RecipeStep[];
  onClose: () => void;
  onSubmit: (values: RecipeFormValues) => void;
}

const stepsToText = (steps?: RecipeStep[]) =>
  steps?.map((step) => step.instruction).join("\n") ?? "";

export function RecipeFormDialog({
  isOpen,
  isLoading = false,
  isSubmitting = false,
  recipe,
  steps,
  onClose,
  onSubmit,
}: RecipeFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (isInitialized) return;
    if (isLoading) return;

    if (recipe) {
      setName(recipe.name);
      setDescription(recipe.description ?? "");
      setStepsText(stepsToText(steps));
    } else {
      setName("");
      setDescription("");
      setStepsText("");
    }
    setError(null);
    setIsInitialized(true);
  }, [isOpen, recipe, steps, isLoading, isInitialized]);

  useEffect(() => {
    if (!isOpen) {
      setIsInitialized(false);
      return;
    }

    if (recipe) {
      setIsInitialized(false);
    }
  }, [isOpen, recipe]);

  if (!isOpen) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Vui lòng nhập tên công thức");
      return;
    }

    const normalizedSteps = stepsText
      .split("\n")
      .map((step) => step.trim())
      .filter(Boolean);

    if (normalizedSteps.length === 0) {
      setError("Vui lòng nhập ít nhất một bước pha chế");
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      steps: normalizedSteps,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-subtle bg-surface p-6 shadow-2xl shadow-black/25">
        <h3 className="text-xl font-semibold text-primary">
          {recipe ? "Chỉnh sửa công thức" : "Tạo công thức mới"}
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="recipe-name"
                className="mb-2 block text-sm font-medium text-subtle"
              >
                Tên công thức
                <span className="ml-1 text-rose-400">*</span>
              </label>
              <input
                id="recipe-name"
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm text-primary placeholder-subtle shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
                placeholder="Ví dụ: Cà phê sữa, Trà trái cây..."
              />
            </div>

            <div>
              <label
                htmlFor="recipe-description"
                className="mb-2 block text-sm font-medium text-subtle"
              >
                Mô tả (tùy chọn)
              </label>
              <input
                id="recipe-description"
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm text-primary placeholder-subtle shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
                placeholder="Mô tả ngắn về công thức"
              />
            </div>

            <div>
              <label
                htmlFor="recipe-steps"
                className="mb-2 block text-sm font-medium text-subtle"
              >
                Các bước pha chế
                <span className="ml-1 text-rose-400">*</span>
              </label>
              <textarea
                id="recipe-steps"
                rows={6}
                value={stepsText}
                onChange={(event) => setStepsText(event.target.value)}
                className="w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm text-primary placeholder-subtle shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
                placeholder={`Mỗi dòng là một bước.\nVí dụ:\nRót 50ml cà phê vào ly\nThêm 10ml đường và khuấy đều`}
              />
              <p className="mt-2 text-xs text-muted">
                Nhập mỗi bước trên một dòng để hệ thống tự đánh số thứ tự.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-subtle px-4 py-2 text-sm font-semibold text-subtle transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? recipe
                    ? "Đang cập nhật..."
                    : "Đang tạo..."
                  : recipe
                    ? "Cập nhật"
                    : "Tạo mới"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
