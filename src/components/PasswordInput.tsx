import { useState } from "react";
import { HiEye, HiEyeSlash } from "react-icons/hi2";

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  autoComplete?: string;
  className?: string;
}

export function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  className = "",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-subtle">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm text-primary placeholder-subtle shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-subtle focus:border-blue-500 focus:ring-blue-400"
          }`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted transition hover:bg-surface-muted hover:text-primary"
        >
          {showPassword ? (
            <HiEyeSlash className="h-4 w-4" />
          ) : (
            <HiEye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
