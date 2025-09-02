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
      updateRateMutation.mutate({
        id: rate.id,
        activity_id: activityId,
        hourly_vnd: hourlyVnd,
        effective_from: effectiveFrom,
      }, {
        onSuccess: () => {
          onClose();
        },
        onError: () => {
          alert("Lỗi khi cập nhật mức lương");
        }
      });
    } else {
      createRateMutation.mutate({
        activity_id: activityId,
        hourly_vnd: hourlyVnd,
        effective_from: effectiveFrom,
      }, {
        onSuccess: () => {
          onClose();
        },
        onError: () => {
          alert("Lỗi khi tạo mức lương");
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {rate ? "Sửa mức lương" : "Thêm mức lương mới"}
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(new FormData(e.target as HTMLFormElement));
          }}
        >
          <div className="mb-4">
            <label htmlFor="rate-activity" className="block text-sm font-medium text-gray-700 mb-1">
              Hoạt động
            </label>
            <select
              id="rate-activity"
              name="activity_id"
              required
              defaultValue={rate?.activity_id || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="mb-4">
            <label htmlFor="rate-hourly" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="rate-effective" className="block text-sm font-medium text-gray-700 mb-1">
              Có hiệu lực từ
            </label>
            <input
              id="rate-effective"
              type="date"
              name="effective_from"
              required
              defaultValue={
                rate
                  ? new Date(rate.effective_from)
                      .toISOString()
                      .split("T")[0]
                  : new Date().toISOString().split("T")[0]
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createRateMutation.isPending || updateRateMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(createRateMutation.isPending || updateRateMutation.isPending) ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}