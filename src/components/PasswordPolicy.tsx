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
  const styles =
    variant === "notice"
      ? {
          container: "border-blue-200 bg-blue-50 text-primary",
          heading: "text-blue-600",
          list: "text-blue-500",
          icon: "text-blue-500",
        }
      : {
          container: "border-subtle bg-surface-muted text-subtle",
          heading: "text-primary",
          list: "text-subtle",
          icon: "text-blue-500",
        };

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm transition-colors ${styles.container} ${className}`}
    >
      <h3 className={`mb-2 flex items-center gap-2 text-sm font-semibold ${styles.heading}`}>
        <HiShieldCheck className={`h-4 w-4 ${styles.icon}`} />
        {title}
      </h3>
      <ul className={`list-disc space-y-1.5 pl-5 text-xs leading-relaxed ${styles.list}`}>
        <li>{PASSWORD_POLICY.MIN_LENGTH}</li>
        <li>{PASSWORD_POLICY.STRONG_RECOMMENDATION}</li>
      </ul>
    </div>
  );
}
