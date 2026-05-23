import { Link } from "@tanstack/react-router";
import { FaArrowLeft } from "react-icons/fa";

interface BackLinkProps {
  to: string;
  label: string;
  className?: string;
}

export function BackLink({ to, label, className = "" }: BackLinkProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 text-sm font-medium text-subtle transition hover:text-primary ${className}`}
    >
      <FaArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
