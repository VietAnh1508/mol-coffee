import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  HiCheck,
  HiEnvelope,
  HiLockClosed,
  HiPencil,
  HiPhone,
  HiUser,
  HiXMark,
} from "react-icons/hi2";
import { Layout } from "../components/Layout";
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
    <Layout>
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <HiUser className="w-8 h-8 mr-2" />
            Thông tin cá nhân
          </h1>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 flex items-center"
            >
              <HiPencil className="w-4 h-4 mr-1" />
              Chỉnh sửa
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* Avatar placeholder */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <HiUser className="w-12 h-12 text-gray-400" />
              </div>
            </div>

            {/* Profile fields */}
            <div className="space-y-6">
              {/* Name field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiUser className="inline w-4 h-4 mr-1" />
                  Họ và tên
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 ${
                        errors.name
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      }`}
                      placeholder="Nhập họ và tên"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                    {user.name}
                  </p>
                )}
              </div>

              {/* Phone field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiPhone className="inline w-4 h-4 mr-1" />
                  Số điện thoại
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="tel"
                      value={editedPhone}
                      onChange={(e) => setEditedPhone(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 ${
                        errors.phone
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      }`}
                      placeholder="0xxxxxxxxx"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md">
                    {user.phone}
                  </p>
                )}
              </div>

              {/* Email field (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <HiEnvelope className="inline w-4 h-4 mr-1" />
                  Email
                </label>
                <p className="text-gray-600 py-2 px-3 bg-gray-50 rounded-md text-sm">
                  {user.email}
                </p>
              </div>

              {/* Role field (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vai trò
                </label>
                <p className="text-gray-600 py-2 px-3 bg-gray-50 rounded-md text-sm">
                  {user.role === "admin" ? "Quản trị viên" : "Nhân viên"}
                </p>
              </div>

              {/* Change Password Section */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Bảo mật</h3>
                <Link
                  to="/change-password"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <HiLockClosed className="w-4 h-4 mr-2" />
                  Đổi mật khẩu
                </Link>
              </div>
            </div>

            {/* Action buttons */}
            {isEditing && (
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCancel}
                  disabled={updateProfileMutation.isPending}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <HiXMark className="w-4 h-4 mr-1" />
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <HiCheck className="w-4 h-4 mr-1" />
                  {updateProfileMutation.isPending
                    ? "Đang lưu..."
                    : "Lưu thay đổi"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
