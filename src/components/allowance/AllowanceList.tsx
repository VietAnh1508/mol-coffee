import { useState } from "react";
import { FaCalendarAlt, FaEdit } from "react-icons/fa";
import { HiPlus } from "react-icons/hi2";
import { useAllowanceRates } from "../../hooks/useAllowanceRates";
import type { AllowanceRate } from "../../types";
import { formatDateDMY } from "../../utils/dateUtils";
import { formatMoney } from "../../utils/payrollUtils";
import { RATE_STATUS_ORDER, getEffectivePeriodStatus } from "../../utils/rateStatus";
import { Spinner } from "../Spinner";
import { RateStatusBadge } from "../rates/RateStatusBadge";
import { AllowanceForm } from "./AllowanceForm";
import type { AllowanceFormMode } from "./AllowanceForm";

interface AllowanceListProps {
  readonly canManage?: boolean;
}

export function AllowanceList({ canManage = true }: AllowanceListProps) {
  const { data: rates = [], isLoading } = useAllowanceRates("lunch");

  const [formMode, setFormMode] = useState<AllowanceFormMode>("create");
  const [selectedRate, setSelectedRate] = useState<AllowanceRate | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleScheduleChange = (rate: AllowanceRate) => {
    if (!canManage) return;
    setSelectedRate(rate);
    setFormMode("schedule-change");
    setShowForm(true);
  };

  const handleEditFuture = (rate: AllowanceRate) => {
    if (!canManage) return;
    setSelectedRate(rate);
    setFormMode("edit-future");
    setShowForm(true);
  };

  const handleAdd = () => {
    if (!canManage) return;
    setSelectedRate(null);
    setFormMode("create");
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setSelectedRate(null);
    setShowForm(false);
  };

  const sortedRates = [...rates].sort((a, b) => {
    const statusDiff =
      RATE_STATUS_ORDER[getEffectivePeriodStatus(a)] -
      RATE_STATUS_ORDER[getEffectivePeriodStatus(b)];
    if (statusDiff !== 0) return statusDiff;
    return b.amount_vnd - a.amount_vnd;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-primary">
          Quản lý phụ cấp
        </h2>
        {canManage && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
          >
            <HiPlus className="w-4 h-4" />
            Thêm phụ cấp
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-subtle bg-surface shadow-lg shadow-black/5">
        <ul>
          {sortedRates.map((rate, index) => {
            const status = getEffectivePeriodStatus(rate);
            return (
              <li
                key={rate.id}
                className={`px-6 py-4 ${index < sortedRates.length - 1 ? "border-b border-subtle" : ""}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-primary">
                        Phụ cấp ăn trưa
                      </h3>
                      <RateStatusBadge status={status} />
                    </div>
                    <div className="mt-1 text-sm text-subtle">
                      <span className="font-medium">
                        {formatMoney(rate.amount_vnd)}/ngày
                      </span>
                      {" • "}
                      <span>
                        Từ: {formatDateDMY(new Date(rate.effective_from))}
                      </span>
                      {rate.effective_to && (
                        <>
                          {" • "}
                          <span>
                            Đến: {formatDateDMY(new Date(rate.effective_to))}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {canManage && status !== "expired" && (
                    <button
                      onClick={() =>
                        status === "active"
                          ? handleScheduleChange(rate)
                          : handleEditFuture(rate)
                      }
                      aria-label={
                        status === "active"
                          ? "Lên lịch thay đổi phụ cấp"
                          : "Chỉnh sửa phụ cấp"
                      }
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-subtle px-3 py-1.5 text-xs font-semibold text-subtle transition hover:bg-surface-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
                    >
                      {status === "active" ? (
                        <>
                          <FaCalendarAlt className="h-3 w-3" />
                          Thay đổi
                        </>
                      ) : (
                        <>
                          <FaEdit className="h-3 w-3" />
                          Sửa
                        </>
                      )}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {canManage && showForm && (
        <AllowanceForm
          mode={formMode}
          rate={selectedRate}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
