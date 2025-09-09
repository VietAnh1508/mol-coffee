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
    <div className="rounded-md shadow-sm -space-y-px">
      <div>
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
          placeholder="Email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password" className="sr-only">
          Mật khẩu
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
        />
      </div>
    </div>
  );
}
