import { type PropsWithChildren } from "react";

interface AuthFormContainerProps {
  title: string;
  subtitle?: string;
}

export function AuthFormContainer({
  title,
  subtitle = "MoL Coffee",
  children,
}: PropsWithChildren<AuthFormContainerProps>) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-page px-4 py-12 text-primary sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-500/25 via-purple-500/20 to-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-32 right-1/4 h-60 w-60 rounded-full bg-gradient-to-br from-sky-500/15 via-blue-500/10 to-transparent blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-subtle bg-surface px-8 py-10 shadow-xl shadow-black/10 transition-colors">
        <div className="flex flex-col items-center space-y-4 text-center">
          <img
            src="/mol-house-logo.jpg"
            alt="MoL House Logo"
            className="h-20 w-20 rounded-full object-cover shadow-lg shadow-black/10"
          />
          <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-subtle">{subtitle}</p>
        </div>
        <div className="mt-8 space-y-6">{children}</div>
      </div>
    </div>
  );
}
