import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { HiArrowLeft, HiLockClosed } from "react-icons/hi2";
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
      const { data, error: getUserError } = await supabase.auth.getUser();
      if (getUserError) {
        throw getUserError;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        setErrors({ currentPassword: "Mật khẩu hiện tại không đúng" });
        setIsLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      showToast("Đổi mật khẩu thành công", "success");

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
    <div className="mx-auto max-w-xl px-4 text-primary">
      <div className="mb-8">
        <Link
          to="/profile"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-subtle transition hover:text-primary"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-muted text-blue-400">
            <HiArrowLeft className="h-3.5 w-3.5" />
          </span>
          Quay lại thông tin cá nhân
        </Link>

        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/15 text-blue-400">
            <HiLockClosed className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-3xl font-semibold text-primary sm:text-4xl">
              Đổi mật khẩu
            </h1>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-subtle bg-surface shadow-lg shadow-black/10">
        <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
          </button>
        </form>
      </div>

      <PasswordPolicy
        title="Lưu ý bảo mật"
        variant="notice"
        className="mt-6 rounded-2xl border border-subtle bg-surface px-6 py-5"
      />
    </div>
  );
}
