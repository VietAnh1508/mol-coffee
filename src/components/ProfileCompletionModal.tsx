import { useState } from "react";
import { useUpdateUserProfile } from "../hooks/useUserMutations";
import type { User } from "../types";
import {
  getPhoneValidationMessage,
  isValidVietnamesePhone,
} from "../utils/phoneValidation";

interface ProfileCompletionModalProps {
  readonly user: User;
}

export function ProfileCompletionModal({ user }: ProfileCompletionModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [validationError, setValidationError] = useState("");

  const updateProfileMutation = useUpdateUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setValidationError("Vui lòng nhập tên");
      return;
    }

    if (!phone.trim()) {
      setValidationError("Vui lòng nhập số điện thoại");
      return;
    }

    if (!isValidVietnamesePhone(phone.trim())) {
      const phoneError = getPhoneValidationMessage(phone.trim());
      setValidationError(phoneError || "Số điện thoại không hợp lệ");
      return;
    }

    setValidationError("");
    updateProfileMutation.mutate({
      userId: user.id,
      name: name.trim(),
      phone: phone.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Hoàn tất thông tin cá nhân
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Vui lòng cung cấp tên và số điện thoại để tiếp tục
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Tên
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Nhập tên của bạn"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Số điện thoại
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Nhập số điện thoại"
            />
          </div>

          {(validationError || updateProfileMutation.error) && (
            <div className="text-red-600 text-sm">
              {validationError ||
                updateProfileMutation.error?.message ||
                "Có lỗi xảy ra khi cập nhật thông tin"}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? "Đang lưu..." : "Hoàn tất"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
