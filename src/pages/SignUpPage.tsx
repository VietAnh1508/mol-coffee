import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthFormContainer, AuthFormFields, AuthMessages } from "../components/auth";
import { PasswordPolicy } from "../components/PasswordPolicy";
import { useAuth } from "../hooks";

export function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error.message || "Failed to create account");
      } else {
        setSuccessMessage("Tài khoản được tạo thành công! Vui lòng đăng nhập.");
        setPassword(""); // Clear password for security
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormContainer title="Tạo tài khoản">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <AuthFormFields
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
        />

        <PasswordPolicy variant="info" className="mt-4" />

        <AuthMessages error={error} successMessage={successMessage} />

        <div>
          <button
            type="submit"
            disabled={loading}
            className="relative flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang tải..." : "Đăng ký"}
          </button>
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="text-blue-600 transition-colors hover:text-blue-400"
          >
            Đã có tài khoản? Đăng nhập
          </Link>
        </div>
      </form>
    </AuthFormContainer>
  );
}
