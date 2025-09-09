import { HiShieldCheck } from "react-icons/hi2";
import { PASSWORD_POLICY } from "../constants/password";

interface PasswordPolicyProps {
  title?: string;
  variant?: "info" | "notice";
  className?: string;
}

export function PasswordPolicy({
  title = "Yêu cầu mật khẩu",
  variant = "info",
  className = "",
}: PasswordPolicyProps) {
  const bgColor =
    variant === "notice"
      ? "bg-blue-50 border-blue-200"
      : "bg-gray-50 border-gray-200";
  const textColor = variant === "notice" ? "text-blue-800" : "text-gray-800";
  const listColor = variant === "notice" ? "text-blue-700" : "text-gray-700";

  return (
    <div className={`border rounded-lg p-4 ${bgColor} ${className}`}>
      <h3 className={`text-sm font-medium ${textColor} mb-2 flex items-center`}>
        <HiShieldCheck className="w-4 h-4 mr-1" />
        {title}
      </h3>
      <ul className={`text-xs ${listColor} space-y-1`}>
        <li>• {PASSWORD_POLICY.MIN_LENGTH}</li>
        <li>• {PASSWORD_POLICY.STRONG_RECOMMENDATION}</li>
      </ul>
    </div>
  );
}
