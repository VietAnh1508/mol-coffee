import type { RateStatus } from "../components/rates/RateStatusBadge";

export function getEffectivePeriodStatus(period: {
  effective_from: string;
  effective_to: string | null;
}): RateStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const from = new Date(period.effective_from);
  if (from > today) return "future";
  if (period.effective_to !== null && new Date(period.effective_to) < today)
    return "expired";
  return "active";
}

export const RATE_STATUS_ORDER: Record<RateStatus, number> = {
  future: 0,
  active: 1,
  expired: 2,
};
