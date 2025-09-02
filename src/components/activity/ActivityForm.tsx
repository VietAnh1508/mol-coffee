import { useCreateActivity, useUpdateActivity } from "../../hooks";
import type { Activity } from "../../types";

interface ActivityFormProps {
  activity?: Activity | null;
  onClose: () => void;
}

export function ActivityForm({ activity, onClose }: ActivityFormProps) {
  const createActivityMutation = useCreateActivity();
  const updateActivityMutation = useUpdateActivity();

  const handleSave = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const isActive = formData.get("is_active") === "true";

    if (activity) {
      updateActivityMutation.mutate({
        id: activity.id,
        name,
        is_active: isActive
      }, {
        onSuccess: () => {
          onClose();
        },
        onError: () => {
          alert("Lỗi khi cập nhật hoạt động");
        }
      });
    } else {
      createActivityMutation.mutate({
        name,
        is_active: isActive
      }, {
        onSuccess: () => {
          onClose();
        },
        onError: () => {
          alert("Lỗi khi tạo hoạt động");
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {activity ? "Sửa hoạt động" : "Thêm hoạt động mới"}
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(new FormData(e.target as HTMLFormElement));
          }}
        >
          <div className="mb-4">
            <label htmlFor="activity-name" className="block text-sm font-medium text-gray-700 mb-1">
              Tên hoạt động
            </label>
            <input
              id="activity-name"
              type="text"
              name="name"
              required
              defaultValue={activity?.name || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                value="true"
                defaultChecked={activity?.is_active ?? true}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Hoạt động</span>
            </label>
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
              disabled={createActivityMutation.isPending || updateActivityMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(createActivityMutation.isPending || updateActivityMutation.isPending) ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}