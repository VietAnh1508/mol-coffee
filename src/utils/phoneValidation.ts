// Vietnamese mobile phone number validation

export const VIETNAMESE_PHONE_REGEX = /^0[3-9]\d{8}$/;

export const isValidVietnamesePhone = (phone: string): boolean => {
  return VIETNAMESE_PHONE_REGEX.test(phone);
};

export const formatPhoneForDisplay = (phone: string): string => {
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Format as 0XXX XXX XXX for better readability
  if (digits.length === 10 && digits.startsWith("0")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  return phone;
};

export const getPhoneValidationMessage = (phone: string): string => {
  if (!phone.trim()) {
    return "Vui lòng nhập số điện thoại";
  }

  if (!isValidVietnamesePhone(phone)) {
    return "Số điện thoại không hợp lệ";
  }

  return "";
};
