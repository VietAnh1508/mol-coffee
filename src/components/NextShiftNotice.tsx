import { SHIFT_TEMPLATES } from "../constants/shifts";
import { USER_ROLES } from "../constants/userRoles";
import { useNextScheduleShift } from "../hooks";
import type { User } from "../types";
import { formatDateDMY } from "../utils/dateUtils";

interface NextShiftNoticeProps {
  user: User;
}

export function NextShiftNotice({ user }: NextShiftNoticeProps) {
  const isEmployee = user.role === USER_ROLES.EMPLOYEE;

  const {
    data: nextShift,
    isLoading,
    isError,
  } = useNextScheduleShift(isEmployee ? user.id : undefined);

  if (!isEmployee) {
    return null;
  }

  if (isLoading) {
    return (
      <p className="inline-flex items-center rounded-xl border border-subtle bg-surface-muted px-3 py-2 text-sm text-subtle">
        Đang tải ca làm tiếp theo…
      </p>
    );
  }

  if (isError) {
    return (
      <p className="inline-flex items-center rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
        Không thể tải ca làm tiếp theo
      </p>
    );
  }

  if (!nextShift) {
    return null;
  }

  const templateLabel = SHIFT_TEMPLATES[nextShift.template_name].label;
  const shiftDateStr = formatDateDMY(new Date(nextShift.start_ts));

  return (
    <p className="inline-flex items-center rounded-xl border border-subtle bg-surface-muted px-3 py-2 text-sm text-primary">
      Ca làm tiếp theo: {templateLabel} ngày {shiftDateStr}
    </p>
  );
}
