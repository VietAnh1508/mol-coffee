import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AuthFormContainer, AuthMessages } from "../components/auth";
import { PasswordInput } from "../components/PasswordInput";
import { PasswordPolicy } from "../components/PasswordPolicy";
import { PASSWORD_MIN_LENGTH } from "../constants/password";
import { useAuth, useToast } from "../hooks";
import { supabase } from "../lib/supabase";

type PageState = "checking" | "ready" | "error";

interface FieldErrors {
  password?: string;
  confirmPassword?: string;
}

function clearAuthParams() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.hash = "";
  url.searchParams.delete("code");
  url.searchParams.delete("type");
  window.history.replaceState({}, document.title, url.toString());
}

async function ensureRecoverySession(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;

  if (hash) {
    const params = new URLSearchParams(hash);
    const type = params.get("type");
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (type === "recovery" && accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) throw error;
      return true;
    }
  }

  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  if (type === "recovery" && code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return true;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  return Boolean(data.session);
}

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [pageState, setPageState] = useState<PageState>("checking");
  const [statusError, setStatusError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && isMounted) {
        clearAuthParams();
        setStatusError("");
        setPageState("ready");
      }
    });

    ensureRecoverySession()
      .then((hasSession) => {
        if (!isMounted) return;

        if (hasSession) {
          clearAuthParams();
          setStatusError("");
          setPageState("ready");
          return;
        }

        setStatusError(
          "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại."
        );
        setPageState("error");
      })
      .catch((error) => {
        console.error("Error preparing password recovery session:", error);
        if (!isMounted) return;
        setStatusError(
          "Không thể xác thực yêu cầu đặt lại mật khẩu. Vui lòng thử lại."
        );
        setPageState("error");
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const instructions = useMemo(
    () =>
      "Vui lòng nhập mật khẩu mới của bạn bên dưới. Sau khi đặt lại thành công, bạn sẽ được chuyển về trang đăng nhập.",
    []
  );

  const validateForm = () => {
    const errors: FieldErrors = {};

    if (!password.trim()) {
      errors.password = "Vui lòng nhập mật khẩu mới";
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      errors.password = `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự`;
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await resetPassword(password);
      if (error) {
        setFormError(
          error.message ||
            "Không thể đặt lại mật khẩu. Vui lòng kiểm tra liên kết và thử lại."
        );
        return;
      }

      showToast(
        "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.",
        "success"
      );

      await supabase.auth.signOut();

      navigate({ to: "/login" });
    } catch (submitError) {
      console.error("Error resetting password:", submitError);
      setFormError("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageState === "checking") {
    return (
      <AuthFormContainer
        title="Đang xác thực yêu cầu"
        subtitle="Vui lòng chờ trong giây lát..."
      >
        <div className="rounded-xl border border-subtle bg-surface px-4 py-6 text-center text-sm text-subtle shadow-sm">
          Đang kiểm tra liên kết đặt lại mật khẩu của bạn.
        </div>
      </AuthFormContainer>
    );
  }

  if (pageState === "error") {
    return (
      <AuthFormContainer title="Không thể đặt lại mật khẩu">
        <div className="space-y-6">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-5 text-center text-sm font-medium text-red-600 shadow-sm">
            {statusError}
          </div>
          <div className="text-center text-sm">
            <Link
              to="/forgot-password"
              className="text-blue-600 transition-colors hover:text-blue-400"
            >
              Yêu cầu liên kết mới
            </Link>
          </div>
        </div>
      </AuthFormContainer>
    );
  }

  return (
    <AuthFormContainer
      title="Đặt lại mật khẩu"
      subtitle="Đặt mật khẩu mới cho tài khoản của bạn"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <p className="text-sm text-subtle">{instructions}</p>

        <PasswordInput
          label="Mật khẩu mới"
          value={password}
          onChange={setPassword}
          placeholder={`Nhập mật khẩu mới (ít nhất ${PASSWORD_MIN_LENGTH} ký tự)`}
          error={fieldErrors.password}
          autoComplete="new-password"
        />

        <PasswordInput
          label="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Nhập lại mật khẩu mới"
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
        />

        <AuthMessages error={formError} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="relative flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Đang đặt lại..." : "Cập nhật mật khẩu"}
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

      <PasswordPolicy className="mt-6 rounded-2xl border border-subtle bg-surface px-6 py-5" />
    </AuthFormContainer>
  );
}
