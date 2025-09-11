import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { HiArrowLeft, HiLockClosed } from "react-icons/hi2";
import { Layout } from "../components/Layout";
import { PasswordInput } from "../components/PasswordInput";
import { PasswordPolicy } from "../components/PasswordPolicy";
import { PASSWORD_MIN_LENGTH } from "../constants/password";
import { useToast } from "../hooks/useToast";
import { supabase } from "../lib/supabase";

export function ChangePasswordPage() {
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (newPassword.length < PASSWORD_MIN_LENGTH) {
      newErrors.newPassword = `Mật khẩu mới phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự`;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (currentPassword === newPassword) {
      newErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        setErrors({ currentPassword: "Mật khẩu hiện tại không đúng" });
        setIsLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      showToast("Đổi mật khẩu thành công", "success");

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (error) {
      console.error("Error changing password:", error);
      showToast("Có lỗi xảy ra khi đổi mật khẩu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4">
        <div className="mb-6">
          <Link
            to="/profile"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <HiArrowLeft className="w-4 h-4 mr-1" />
            Quay lại thông tin cá nhân
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <HiLockClosed className="w-8 h-8 mr-2" />
            Đổi mật khẩu
          </h1>
          <p className="mt-2 text-gray-600">
            Nhập mật khẩu hiện tại và mật khẩu mới để thay đổi
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <PasswordInput
              label="Mật khẩu hiện tại"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Nhập mật khẩu hiện tại"
              error={errors.currentPassword}
              autoComplete="current-password"
            />

            <PasswordInput
              label="Mật khẩu mới"
              value={newPassword}
              onChange={setNewPassword}
              placeholder={`Nhập mật khẩu mới (ít nhất ${PASSWORD_MIN_LENGTH} ký tự)`}
              error={errors.newPassword}
              autoComplete="new-password"
            />

            <PasswordInput
              label="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Nhập lại mật khẩu mới"
              error={errors.confirmPassword}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
            </button>
          </form>
        </div>

        {/* Password Policy */}
        <PasswordPolicy
          title="Lưu ý bảo mật"
          variant="notice"
          className="mt-6"
        />
      </div>
    </Layout>
  );
}
