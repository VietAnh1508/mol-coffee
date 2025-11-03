import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthFormContainer, AuthMessages } from "../components/auth";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../hooks";

function resolveRedirectUrl(): string | null {
  const rawSiteUrl = import.meta.env.VITE_SITE_URL as string | undefined;
  const siteUrl = rawSiteUrl?.trim();
  if (siteUrl) {
    return siteUrl.replace(/\/+$/, "") + "/reset-password";
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/reset-password`;
  }

  return null;
}

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setError("Vui lòng nhập email đã đăng ký tài khoản");
      return;
    }

    const redirectTo = resolveRedirectUrl();

    if (!redirectTo) {
      setError(
        "Ứng dụng chưa được cấu hình URL chuyển hướng. Vui lòng liên hệ quản trị viên."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: resetError } = await requestPasswordReset(
        email.trim(),
        redirectTo
      );

      if (resetError) {
        if (resetError.code === "invalid_email") {
          setError("Email không hợp lệ. Vui lòng kiểm tra và thử lại.");
        } else {
          setError(
            resetError.message ||
              "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau."
          );
        }
        return;
      }

      setSuccessMessage(
        "Email hướng dẫn đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư (bao gồm mục Spam)."
      );
    } catch (submitError) {
      console.error("Error requesting password reset:", submitError);
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormContainer title="Khôi phục mật khẩu">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4 text-sm text-subtle">
          <p>
            Một email chứa liên kết đặt lại mật khẩu sẽ được gửi tới địa chỉ
            email bạn đã đăng ký. Liên kết chỉ có hiệu lực trong thời gian ngắn.
          </p>
        </div>

        <div className="space-y-4">
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="block w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm text-primary placeholder-subtle shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-surface"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </div>

        <AuthMessages error={error} successMessage={successMessage} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="relative flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Spinner size="sm" className="mr-2" />}
          Gửi liên kết đặt lại mật khẩu
        </button>

        <div className="text-center text-sm">
          <Link
            to="/login"
            className="text-blue-600 transition-colors hover:text-blue-400"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </form>
    </AuthFormContainer>
  );
}
