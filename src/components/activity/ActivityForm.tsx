import { useCreateActivity, useToast, useUpdateActivity } from "../../hooks";
import type { Activity } from "../../types";

interface ActivityFormProps {
  activity?: Activity | null;
  onClose: () => void;
}

export function ActivityForm({ activity, onClose }: ActivityFormProps) {
  const createActivityMutation = useCreateActivity();
  const updateActivityMutation = useUpdateActivity();
  const { showToast } = useToast();

  const handleSave = async (formData: FormData) => {
    const name = formData.get("name") as string;

    if (activity) {
      updateActivityMutation.mutate(
        {
          id: activity.id,
          name,
        },
        {
          onSuccess: () => {
            onClose();
            showToast("Cập nhật hoạt động thành công", "success");
          },
          onError: () => {
            showToast("Có lỗi xảy ra khi cập nhật hoạt động", "error");
          },
        }
      );
    } else {
      createActivityMutation.mutate(
        {
          name,
        },
        {
          onSuccess: () => {
            showToast("Đã tạo hoạt động mới", "success");
            onClose();
          },
          onError: () => {
            showToast("Có lỗi xảy ra khi tạo hoạt động", "error");
          },
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-subtle bg-surface p-6 shadow-2xl shadow-black/25">
        <h3 className="text-xl font-semibold text-primary">
          {activity ? "Sửa hoạt động" : "Thêm hoạt động mới"}
        </h3>
        <form
          className="mt-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(new FormData(e.target as HTMLFormElement));
          }}
        >
          <div>
            <label
              htmlFor="activity-name"
              className="mb-2 block text-sm font-medium text-subtle"
            >
              Tên hoạt động
            </label>
            <input
              id="activity-name"
              type="text"
              name="name"
              required
              defaultValue={activity?.name || ""}
              className="w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm text-primary placeholder-subtle shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
              placeholder="Ví dụ: Pha chế, Thu ngân..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-subtle px-4 py-2 text-sm font-semibold text-subtle transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-surface"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={
                createActivityMutation.isPending ||
                updateActivityMutation.isPending
              }
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createActivityMutation.isPending ||
              updateActivityMutation.isPending
                ? "Đang lưu..."
                : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
