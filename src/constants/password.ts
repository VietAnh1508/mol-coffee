// Password validation constants
export const PASSWORD_MIN_LENGTH = 6;

// Password policy messages
export const PASSWORD_POLICY = {
  MIN_LENGTH: `Mật khẩu phải có ít nhất ${PASSWORD_MIN_LENGTH} ký tự`,
  STRONG_RECOMMENDATION:
    "Nên sử dụng mật khẩu mạnh với chữ hoa, chữ thường, số và ký tự đặc biệt",
} as const;
