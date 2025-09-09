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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-6">
            <img
              src="/mol-house-logo.jpg"
              alt="MoL House Logo"
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
