import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthFormContainer, AuthFormFields, AuthMessages } from "../components/auth";
import { useAuth } from "../hooks";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await signIn(email, password);

      if (error) {
        // Check for invalid login credentials using Supabase error codes
        if (error.code === "invalid_credentials") {
          setError("Tên đăng nhập hoặc mật khẩu không chính xác");
        } else {
          setError(error.message || "Đăng nhập thất bại");
        }
      }
    } catch {
      setError("Đã xảy ra lỗi không mong muốn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormContainer title="Đăng nhập">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <AuthFormFields
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
        />

        <AuthMessages error={error} />

        <div>
          <button
            type="submit"
            disabled={loading}
            className="relative flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang tải..." : "Đăng nhập"}
          </button>
        </div>

        <div className="text-center text-sm">
          <Link
            to="/forgot-password"
            className="text-blue-600 transition-colors hover:text-blue-400"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <div className="text-center">
          <Link
            to="/signup"
            className="text-blue-600 transition-colors hover:text-blue-400"
          >
            Chưa có tài khoản? Đăng ký
          </Link>
        </div>
      </form>
    </AuthFormContainer>
  );
}
