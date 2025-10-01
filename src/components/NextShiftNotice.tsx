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
    return <p className="text-sm text-gray-600">Đang tải ca làm tiếp theo…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600">Không thể tải ca làm tiếp theo</p>
    );
  }

  if (!nextShift) {
    return null;
  }

  const templateLabel =
    nextShift.template_name === "morning" ? "ca sáng" : "ca chiều";
  const shiftDateStr = formatDateDMY(new Date(nextShift.start_ts));

  return (
    <p className="text-sm text-gray-700">
      Ca làm tiếp theo: {templateLabel} ngày {shiftDateStr}
    </p>
  );
}
