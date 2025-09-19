import { usePayrollDailyBreakdown } from "../../hooks";
import { formatDate, formatHours, formatTime } from "../../utils/dateUtils";
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
      <div className="flex items-center justify-center py-4">
        <Spinner />
        <span className="ml-2 text-sm text-gray-500">Đang tải chi tiết...</span>
      </div>
    );
  }

  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p className="text-sm">Không có dữ liệu chi tiết</p>
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

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => a.localeCompare(b));

  return (
    <div className="border-t border-gray-200">
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-4">
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
                <div key={date} className="bg-gray-50 rounded-lg p-3">
                  {/* Day Header with Total */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                    <h5 className="font-medium text-gray-900">
                      {formatDate(new Date(date))}
                    </h5>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(dayTotal)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatHours(dayHours)}
                      </div>
                    </div>
                  </div>

                  {/* Shift Details */}
                  <div className="space-y-2">
                    {dayEntries.map((entry) => (
                      <div
                        key={entry.shiftId}
                        className="flex items-center justify-between text-sm py-2 px-3 bg-white rounded-md"
                      >
                        <div className="flex items-center space-x-2">
                          {!userId && (
                            <span className="font-medium text-gray-600">
                              {entry.employee.name}
                            </span>
                          )}
                          <span className="text-gray-700">
                            {entry.activity.name} ({formatTime(entry.startTime)}{" "}
                            - {formatTime(entry.endTime)})
                          </span>
                        </div>
                        <div className="font-medium text-gray-900">
                          {formatCurrency(entry.subtotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
