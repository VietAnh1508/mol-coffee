import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { usePayrollDailyBreakdown } from "../../hooks";
import { formatCurrency } from "../../utils/payrollUtils";
import { formatDate, formatHours } from "../../utils/dateUtils";
import { Spinner } from "../Spinner";

interface PayrollDailyBreakdownProps {
  yearMonth: string;
  userId?: string;
  employeeName?: string;
}

export function PayrollDailyBreakdown({ yearMonth, userId, employeeName }: PayrollDailyBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: dailyData, isLoading } = usePayrollDailyBreakdown(yearMonth, userId);

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

  // Group by date
  const groupedByDate = dailyData.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, typeof dailyData>);

  const sortedDates = Object.keys(groupedByDate).sort();

  return (
    <div className="border-t border-gray-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
      >
        <span className="text-sm font-medium text-gray-700">
          Chi tiết theo ngày{employeeName && ` - ${employeeName}`}
        </span>
        {isExpanded ? (
          <FaChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <FaChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="space-y-3">
            {sortedDates.map((date) => {
              const dayEntries = groupedByDate[date];
              const dayTotal = dayEntries.reduce((sum, entry) => sum + entry.subtotal, 0);
              const dayHours = dayEntries.reduce((sum, entry) => sum + entry.hours, 0);

              return (
                <div key={date} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{formatDate(new Date(date))}</h5>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(dayTotal)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatHours(dayHours)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {dayEntries.map((entry) => (
                      <div
                        key={entry.shiftId}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <div className="flex items-center space-x-2">
                          {!userId && (
                            <span className="font-medium text-gray-600">
                              {entry.employee.name}
                            </span>
                          )}
                          <span className="text-gray-700">
                            {entry.activity.name}
                          </span>
                          <span className="text-gray-500">
                            ({formatHours(entry.hours)})
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

          {/* Summary */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                Tổng cộng ({sortedDates.length} ngày)
              </span>
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {formatCurrency(dailyData.reduce((sum, entry) => sum + entry.subtotal, 0))}
                </div>
                <div className="text-xs text-gray-500">
                  {formatHours(dailyData.reduce((sum, entry) => sum + entry.hours, 0))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}