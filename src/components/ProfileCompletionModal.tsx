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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-subtle bg-surface px-6 py-7 shadow-2xl shadow-black/30">
        <div className="mb-5 space-y-2 text-primary">
          <h2 className="text-xl font-semibold">Hoàn tất thông tin cá nhân</h2>
          <p className="text-sm text-subtle">
            Vui lòng cung cấp tên và số điện thoại để tiếp tục
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-subtle"
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
              className="mt-1 block w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm text-primary placeholder-subtle shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
              placeholder="Nhập tên của bạn"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-subtle"
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
              className="mt-1 block w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm text-primary placeholder-subtle shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
              placeholder="Nhập số điện thoại"
            />
          </div>

          {(validationError || updateProfileMutation.error) && (
            <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {validationError ||
                updateProfileMutation.error?.message ||
                "Có lỗi xảy ra khi cập nhật thông tin"}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateProfileMutation.isPending ? "Đang lưu..." : "Hoàn tất"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
