// Default values and patterns for user profile data

export const PLACEHOLDER_PHONE_PREFIX = "+84000000";

export const generatePlaceholderPhone = (userId: string): string => {
  // Use first 3 characters of UUID for unique placeholder
  const suffix = userId.substring(0, 3).padEnd(3, "0");
  return `${PLACEHOLDER_PHONE_PREFIX}${suffix}`;
};

export const isPlaceholderPhone = (phone: string): boolean => {
  return phone.startsWith(PLACEHOLDER_PHONE_PREFIX);
};

export const DEFAULT_USER_NAME = "";
