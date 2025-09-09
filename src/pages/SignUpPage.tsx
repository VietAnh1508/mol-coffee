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
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Đang tải..." : "Đăng ký"}
          </button>
        </div>

        <div className="text-center">
          <Link to="/login" className="text-blue-600 hover:text-blue-500">
            Đã có tài khoản? Đăng nhập
          </Link>
        </div>
      </form>
    </AuthFormContainer>
  );
}
