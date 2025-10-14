import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  HiCheck,
  HiEnvelope,
  HiLockClosed,
  HiPencil,
  HiPhone,
  HiUser,
  HiXMark,
} from "react-icons/hi2";
import { useAuth } from "../hooks";
import { useToast } from "../hooks/useToast";
import { useUpdateUserProfile } from "../hooks/useUserMutations";
import { isValidVietnamesePhone } from "../utils/phoneValidation";

export function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const updateProfileMutation = useUpdateUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [editedPhone, setEditedPhone] = useState(user?.phone || "");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  if (!user) {
    return null;
  }

  const validateForm = () => {
    const newErrors: { name?: string; phone?: string } = {};

    if (!editedName.trim()) {
      newErrors.name = "Tên không được để trống";
    }

    if (!editedPhone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!isValidVietnamesePhone(editedPhone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        userId: user.id,
        name: editedName.trim(),
        phone: editedPhone.trim(),
      });

      setIsEditing(false);
      showToast("Cập nhật thông tin thành công", "success");
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("Có lỗi xảy ra khi cập nhật thông tin", "error");
    }
  };

  const handleCancel = () => {
    setEditedName(user.name);
    setEditedPhone(user.phone);
    setErrors({});
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditedName(user.name);
    setEditedPhone(user.phone);
    setErrors({});
    setIsEditing(true);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 text-primary">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mt-2 flex items-center text-3xl font-semibold sm:text-4xl">
            <span className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-blue-400">
              <HiUser className="h-6 w-6" />
            </span>
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-sky-500 bg-clip-text text-transparent">
              Thông tin cá nhân
            </span>
          </h1>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
          >
            <HiPencil className="h-4 w-4" />
            Chỉnh sửa
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-subtle bg-surface shadow-lg shadow-black/10">
        <div className="p-6 sm:p-8">
          {/* Avatar placeholder */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-muted text-muted">
              <HiUser className="h-12 w-12" />
            </div>
          </div>

          {/* Profile fields */}
          <div className="space-y-6">
            {/* Name field */}
            <div>
              <label className="mb-2 block text-sm font-medium text-subtle">
                <HiUser className="mr-1 inline h-4 w-4" />
                Họ và tên
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-primary placeholder-subtle shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface ${
                      errors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-400"
                        : "border-subtle focus:border-blue-500 focus:ring-blue-400"
                    }`}
                    placeholder="Nhập họ và tên"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>
              ) : (
                <p className="rounded-xl bg-surface-muted px-4 py-3 text-sm text-primary">
                  {user.name}
                </p>
              )}
            </div>

            {/* Phone field */}
            <div>
              <label className="mb-2 block text-sm font-medium text-subtle">
                <HiPhone className="mr-1 inline h-4 w-4" />
                Số điện thoại
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="tel"
                    value={editedPhone}
                    onChange={(e) => setEditedPhone(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-primary placeholder-subtle shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface ${
                      errors.phone
                        ? "border-red-300 focus:border-red-500 focus:ring-red-400"
                        : "border-subtle focus:border-blue-500 focus:ring-blue-400"
                    }`}
                    placeholder="0xxxxxxxxx"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                  )}
                </div>
              ) : (
                <p className="rounded-xl bg-surface-muted px-4 py-3 text-sm text-primary">
                  {user.phone}
                </p>
              )}
            </div>

            {/* Email field (read-only) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-subtle">
                <HiEnvelope className="mr-1 inline h-4 w-4" />
                Email
              </label>
              <p className="rounded-xl bg-surface-muted px-4 py-3 text-sm text-subtle">
                {user.email}
              </p>
            </div>

            {/* Role field (read-only) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-subtle">
                Vai trò
              </label>
              <p className="rounded-xl bg-surface-muted px-4 py-3 text-sm text-subtle">
                {user.role === "admin" ? "Quản trị viên" : "Nhân viên"}
              </p>
            </div>

            {/* Change Password Section */}
            <div className="border-t border-subtle pt-4">
              <h3 className="mb-3 text-sm font-medium text-subtle">Bảo mật</h3>
              <Link
                to="/change-password"
                className="inline-flex items-center gap-2 rounded-xl border border-blue-400/50 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-surface"
              >
                <HiLockClosed className="h-4 w-4" />
                Đổi mật khẩu
              </Link>
            </div>
          </div>

          {/* Action buttons */}
          {isEditing && (
            <div className="mt-8 flex gap-3">
              <button
                onClick={handleCancel}
                disabled={updateProfileMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-subtle px-4 py-2 text-sm font-semibold text-subtle transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
              >
                <HiXMark className="h-4 w-4" />
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
              >
                <HiCheck className="h-4 w-4" />
                {updateProfileMutation.isPending ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
