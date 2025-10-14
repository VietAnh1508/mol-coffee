interface AuthMessagesProps {
  error?: string;
  successMessage?: string;
}

export function AuthMessages({ error, successMessage }: AuthMessagesProps) {
  return (
    <>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600 shadow-sm transition-colors">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-600 shadow-sm transition-colors">
          {successMessage}
        </div>
      )}
    </>
  );
}
