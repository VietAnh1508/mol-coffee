import { Link } from "@tanstack/react-router";
import { FaArrowLeft } from "react-icons/fa";

interface BackLinkProps {
  to: string;
  label: string;
  className?: string;
  params?: Record<string, unknown>;
  search?: Record<string, unknown>;
  hash?: string;
  replace?: boolean;
}

export function BackLink({
  to,
  label,
  className = "",
  params,
  search,
  hash,
  replace,
}: BackLinkProps) {
  return (
    <Link
      to={to}
      params={params}
      search={search}
      hash={hash}
      replace={replace}
      className={`inline-flex items-center gap-2 text-sm font-medium text-subtle transition hover:text-primary ${className}`}
    >
      <FaArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
