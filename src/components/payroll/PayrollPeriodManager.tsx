import { useState } from "react";
import { FaLock, FaLockOpen, FaPlus, FaTrash } from "react-icons/fa";
import {
  useClosePayrollPeriod,
  useDeletePayrollPeriod,
  usePayrollPeriods,
  useReopenPayrollPeriod,
  useToast,
} from "../../hooks";
import { formatMonthName } from "../../utils/payrollUtils";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { Spinner } from "../Spinner";
import { PayrollPeriodForm } from "./PayrollPeriodForm";

interface PayrollPeriodManagerProps {
  onPeriodSelect: (yearMonth: string) => void;
  selectedPeriod?: string | null;
  canManage?: boolean;
}

export function PayrollPeriodManager({
  onPeriodSelect,
  selectedPeriod,
  canManage = true,
}: PayrollPeriodManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    action: "close" | "reopen" | "delete";
    periodId: string;
    periodName: string;
  } | null>(null);

  const { data: periods, isLoading } = usePayrollPeriods();
  const closePeriod = useClosePayrollPeriod();
  const reopenPeriod = useReopenPayrollPeriod();
  const deletePeriod = useDeletePayrollPeriod();
  const { showToast } = useToast();

  const handleFormSuccess = (yearMonth: string) => {
    setShowCreateForm(false);
    onPeriodSelect(yearMonth);
  };

  const handleFormCancel = () => {
    setShowCreateForm(false);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    if (!canManage) {
      setConfirmAction(null);
      return;
    }

    try {
      switch (confirmAction.action) {
        case "close":
          await closePeriod.mutateAsync(confirmAction.periodId);
          showToast("Đã khóa kỳ lương", "success");
          break;
        case "reopen":
          await reopenPeriod.mutateAsync(confirmAction.periodId);
          showToast("Đã mở lại kỳ lương", "success");
          break;
        case "delete":
          await deletePeriod.mutateAsync(confirmAction.periodId);
          showToast("Đã xóa kỳ lương", "success");
          if (selectedPeriod === confirmAction.periodName) {
            // If we deleted the selected period, select the first available one
            const remainingPeriods = periods?.filter(
              (p) => p.id !== confirmAction.periodId
            );
            if (remainingPeriods && remainingPeriods.length > 0) {
              onPeriodSelect(remainingPeriods[0].year_month);
            }
          }
          break;
      }
    } catch (error) {
      console.log(error);
      showToast("Thao tác không thành công", "error");
    } finally {
      setConfirmAction(null);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="rounded-2xl border border-subtle bg-surface p-5 shadow-lg shadow-black/5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">Quản lý kỳ lương</h3>
        {canManage && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
          >
            <FaPlus className="mr-1 h-4 w-4" />
            Tạo kỳ mới
          </button>
        )}
      </div>

      {!selectedPeriod && (
        <p className="mb-4 text-sm text-subtle">
          Chọn kỳ lương để xem dữ liệu.
        </p>
      )}

      {canManage && showCreateForm && (
        <PayrollPeriodForm
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      <div className="space-y-2">
        {periods?.map((period) => (
          <div
            key={period.id}
            className={`flex items-center justify-between rounded-xl border p-3 transition ${
              selectedPeriod === period.year_month
                ? "border-blue-400 bg-blue-500/10"
                : "border-subtle hover:bg-surface-muted"
            }`}
          >
            <div className="flex-1">
              <button
                onClick={() => onPeriodSelect(period.year_month)}
                className="text-left w-full"
              >
                <div className="font-semibold text-primary">
                  {formatMonthName(period.year_month)}
                </div>
                <div className="text-sm text-subtle">
                  {period.status === "closed" ? (
                    <span className="inline-flex items-center">
                      <FaLock className="mr-1 h-4 w-4" />
                      Đã khóa
                      {period.closed_by_user &&
                        ` bởi ${period.closed_by_user.name}`}
                    </span>
                  ) : (
                    <span className="inline-flex items-center">
                      <FaLockOpen className="mr-1 h-4 w-4" />
                      Đang mở
                    </span>
                  )}
                </div>
              </button>
            </div>

            {canManage && (
              <div className="flex items-center gap-1">
                {period.status === "open" ? (
                  <button
                    onClick={() =>
                      setConfirmAction({
                        action: "close",
                        periodId: period.id,
                        periodName: period.year_month,
                      })
                    }
                    className="rounded-lg p-2 text-amber-300 transition hover:bg-amber-500/15"
                    title="Khóa kỳ lương"
                  >
                    <FaLock className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      setConfirmAction({
                        action: "reopen",
                        periodId: period.id,
                        periodName: period.year_month,
                      })
                    }
                    className="rounded-lg p-2 text-emerald-300 transition hover:bg-emerald-500/15"
                    title="Mở lại kỳ lương"
                  >
                    <FaLockOpen className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={() =>
                    setConfirmAction({
                      action: "delete",
                      periodId: period.id,
                      periodName: period.year_month,
                    })
                  }
                  className="rounded-lg p-2 text-rose-300 transition hover:bg-rose-500/15"
                  title="Xóa kỳ lương"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}

        {(!periods || periods.length === 0) && (
          <div className="py-8 text-center text-sm text-subtle">
            <p>Chưa có kỳ lương nào</p>
            <p className="text-sm">Tạo kỳ lương đầu tiên để bắt đầu</p>
          </div>
        )}
      </div>

      {canManage && confirmAction && (
        <ConfirmationDialog
          isOpen={true}
          title={
            confirmAction.action === "close"
              ? "Khóa kỳ lương"
              : confirmAction.action === "reopen"
                ? "Mở lại kỳ lương"
                : "Xóa kỳ lương"
          }
          message={
            confirmAction.action === "close"
              ? `Bạn có chắc muốn khóa kỳ lương ${formatMonthName(confirmAction.periodName)}? Việc này sẽ ngăn không cho chỉnh sửa lịch làm việc trong kỳ này.`
              : confirmAction.action === "reopen"
                ? `Bạn có chắc muốn mở lại kỳ lương ${formatMonthName(confirmAction.periodName)}? Việc này sẽ cho phép chỉnh sửa lịch làm việc lại.`
                : `Bạn có chắc muốn xóa kỳ lương ${formatMonthName(confirmAction.periodName)}? Việc này không thể hoàn tác.`
          }
          confirmText={
            confirmAction.action === "close"
              ? "Khóa"
              : confirmAction.action === "reopen"
                ? "Mở lại"
                : "Xóa"
          }
          onConfirm={handleConfirmAction}
          onClose={() => setConfirmAction(null)}
          isLoading={
            closePeriod.isPending ||
            reopenPeriod.isPending ||
            deletePeriod.isPending
          }
        />
      )}
    </div>
  );
}
