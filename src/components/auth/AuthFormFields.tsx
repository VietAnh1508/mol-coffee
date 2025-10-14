interface AuthFormFieldsProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}

export function AuthFormFields({
  email,
  password,
  onEmailChange,
  onPasswordChange,
}: AuthFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="block w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm text-primary placeholder-subtle shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-surface"
          placeholder="Email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="sr-only">
          Mật khẩu
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="block w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm text-primary placeholder-subtle shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-surface"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
        />
      </div>
    </div>
  );
}
