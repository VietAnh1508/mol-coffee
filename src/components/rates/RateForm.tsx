import { useActivities, useCreateRate, useUpdateRate } from "../../hooks";
import type { Rate } from "../../types";

interface RateFormProps {
  rate?: Rate | null;
  onClose: () => void;
}

export function RateForm({ rate, onClose }: RateFormProps) {
  const { data: activities = [] } = useActivities();
  const createRateMutation = useCreateRate();
  const updateRateMutation = useUpdateRate();

  const handleSave = async (formData: FormData) => {
    const activityId = formData.get("activity_id") as string;
    const hourlyVnd = parseInt(formData.get("hourly_vnd") as string);
    const effectiveFrom = formData.get("effective_from") as string;

    if (rate) {
      updateRateMutation.mutate(
        {
          id: rate.id,
          activity_id: activityId,
          hourly_vnd: hourlyVnd,
          effective_from: effectiveFrom,
        },
        {
          onSuccess: () => {
            onClose();
          },
          onError: () => {
            alert("Lỗi khi cập nhật mức lương");
          },
        }
      );
    } else {
      createRateMutation.mutate(
        {
          activity_id: activityId,
          hourly_vnd: hourlyVnd,
          effective_from: effectiveFrom,
        },
        {
          onSuccess: () => {
            onClose();
          },
          onError: () => {
            alert("Lỗi khi tạo mức lương");
          },
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-subtle bg-surface p-6 shadow-2xl shadow-black/25">
        <h3 className="text-xl font-semibold text-primary">
          {rate ? "Sửa mức lương" : "Thêm mức lương mới"}
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
              htmlFor="rate-activity"
              className="mb-2 block text-sm font-medium text-subtle"
            >
              Hoạt động
            </label>
            <select
              id="rate-activity"
              name="activity_id"
              required
              defaultValue={rate?.activity_id || ""}
              className="w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm text-primary shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
            >
              <option value="">Chọn hoạt động</option>
              {activities
                .filter((a) => a.is_active)
                .map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="rate-hourly"
              className="mb-2 block text-sm font-medium text-subtle"
            >
              Mức lương theo giờ (VND)
            </label>
            <input
              id="rate-hourly"
              type="number"
              name="hourly_vnd"
              required
              min="0"
              step="1000"
              defaultValue={rate?.hourly_vnd || ""}
              className="w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm text-primary placeholder-subtle shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
              placeholder="Ví dụ: 35000"
            />
          </div>
          <div>
            <label
              htmlFor="rate-effective"
              className="mb-2 block text-sm font-medium text-subtle"
            >
              Có hiệu lực từ
            </label>
            <input
              id="rate-effective"
              type="date"
              name="effective_from"
              required
              defaultValue={
                rate
                  ? new Date(rate.effective_from).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0]
              }
              className="w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm text-primary shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
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
                createRateMutation.isPending || updateRateMutation.isPending
              }
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createRateMutation.isPending || updateRateMutation.isPending
                ? "Đang lưu..."
                : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
