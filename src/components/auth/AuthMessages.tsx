interface AuthMessagesProps {
  error?: string;
  successMessage?: string;
}

export function AuthMessages({ error, successMessage }: AuthMessagesProps) {
  return (
    <>
      {error && <div className="text-red-600 text-sm text-center">{error}</div>}

      {successMessage && (
        <div className="text-green-600 text-sm text-center bg-green-50 border border-green-200 rounded p-3">
          {successMessage}
        </div>
      )}
    </>
  );
}
