import { Link } from "@tanstack/react-router";
import { usePayrollDailyBreakdown } from "../../hooks";
import {
  formatDateWeekdayDMY,
  formatHours,
  formatTime,
} from "../../utils/dateUtils";
import { formatCurrency } from "../../utils/payrollUtils";
import { Spinner } from "../Spinner";

interface PayrollDailyBreakdownProps {
  readonly yearMonth: string;
  readonly userId?: string;
}

export function PayrollDailyBreakdown({
  yearMonth,
  userId,
}: PayrollDailyBreakdownProps) {
  const { data: dailyData, isLoading } = usePayrollDailyBreakdown(
    yearMonth,
    userId
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4 text-subtle">
        <Spinner />
        <span className="ml-2 text-sm">Đang tải chi tiết...</span>
      </div>
    );
  }

  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-subtle">
        <p>Không có dữ liệu chi tiết</p>
      </div>
    );
  }

  const groupedByDate = dailyData.reduce(
    (acc, entry) => {
      const date = entry.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      return acc;
    },
    {} as Record<string, typeof dailyData>
  );

  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <div className="border-t border-subtle">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-semibold text-subtle">
          Chi tiết theo ngày
        </h4>
        <div className="px-4 pb-4">
          <div className="space-y-3">
            {sortedDates.map((date) => {
              const dayEntries = groupedByDate[date];
              const dayTotal = dayEntries.reduce(
                (sum, entry) => sum + entry.subtotal,
                0
              );
              const dayHours = dayEntries.reduce(
                (sum, entry) => sum + entry.hours,
                0
              );

              return (
                <Link
                  key={date}
                  to="/schedule"
                  search={{ date }}
                  className="block rounded-xl border border-subtle bg-surface-muted p-3 transition hover:bg-surface focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
                >
                  {/* Day Header with Total */}
                  <div className="mb-3 flex items-center justify-between border-b border-subtle pb-2">
                    <h5 className="font-semibold text-primary">
                      {formatDateWeekdayDMY(new Date(date))}
                    </h5>
                    <div className="text-right">
                      <div className="font-semibold text-primary">
                        {formatCurrency(dayTotal)}
                      </div>
                      <div className="text-xs text-subtle">
                        {formatHours(dayHours)}
                      </div>
                    </div>
                  </div>

                  {/* Shift Details */}
                  <div className="space-y-2">
                    {dayEntries.map((entry) => {
                      if (entry.type === "shift") {
                        return (
                          <div
                            key={entry.shiftId}
                            className="flex items-center justify-between rounded-xl border border-subtle bg-surface px-3 py-2 text-sm"
                          >
                            <div className="flex items-center space-x-2">
                              {!userId && (
                                <span className="font-semibold text-subtle">
                                  {entry.employee.name}
                                </span>
                              )}
                              <span className="text-primary">
                                {entry.activity?.name} (
                                {formatTime(entry.startTime!)} -{" "}
                                {formatTime(entry.endTime!)})
                              </span>
                            </div>
                            <div className="font-semibold text-primary">
                              {formatCurrency(entry.subtotal)}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={entry.shiftId}
                          className="flex items-center justify-between rounded-xl border border-subtle bg-surface px-3 py-2 text-sm"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-primary">
                              Phụ cấp ăn trưa
                            </span>
                          </div>
                          <div className="font-semibold text-primary">
                            {formatCurrency(entry.subtotal)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
