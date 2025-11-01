interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "gray" | "white" | "rose" | "emerald" | "sky";
  className?: string;
}

export function Spinner({
  size = "md",
  color = "blue",
  className = "",
}: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const colorClasses = {
    blue: "border-blue-600",
    gray: "border-gray-600",
    white: "border-white",
    rose: "border-rose-500",
    emerald: "border-emerald-500",
    sky: "border-sky-500",
  };

  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </span>
  );
}
