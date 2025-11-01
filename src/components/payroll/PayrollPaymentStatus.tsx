import { useMemo, useState } from "react";
import { FaMoneyBillWave } from "react-icons/fa";
import {
  usePayrollConfirmation,
  useToast,
  useUpdatePayrollPaidStatus,
} from "../../hooks";
import { formatDateTime } from "../../utils/dateUtils";
import { formatMonthName } from "../../utils/payrollUtils";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { Spinner } from "../Spinner";

interface PayrollPaymentStatusProps {
  readonly payrollPeriodId: string | null;
  readonly employeeId: string;
  readonly isAdmin: boolean;
  readonly period: string;
}

type DialogAction = "markPaid" | "unmarkPaid" | null;

export function PayrollPaymentStatus({
  payrollPeriodId,
  employeeId,
  isAdmin,
  period,
}: PayrollPaymentStatusProps) {
  const { showToast } = useToast();
  const [dialogAction, setDialogAction] = useState<DialogAction>(null);
  const [pendingAction, setPendingAction] = useState<DialogAction>(null);

  const { data: confirmation, isLoading } = usePayrollConfirmation(
    payrollPeriodId,
    employeeId
  );
  const updatePayrollPaidStatus = useUpdatePayrollPaidStatus();

  const periodLabel = useMemo(() => formatMonthName(period), [period]);
  const paidTimestamp = useMemo(() => {
    if (!confirmation?.paid_at) return null;
    return formatDateTime(confirmation.paid_at);
  }, [confirmation]);

  const hasConfirmed = Boolean(confirmation);
  const canMarkPaid =
    isAdmin &&
    hasConfirmed &&
    Boolean(payrollPeriodId) &&
    !confirmation?.paid_at;
  const canUnmarkPaid =
    isAdmin && Boolean(payrollPeriodId) && Boolean(confirmation?.paid_at);
  const disabled =
    isLoading || updatePayrollPaidStatus.isPending;

  const isDialogOpen = dialogAction !== null;
  const isMarkingPaid = dialogAction === "markPaid";

  const handleDialogConfirm = async () => {
    if (!dialogAction) return;

    if (!payrollPeriodId) {
      showToast(
        `Kỳ lương ${periodLabel} chưa được tạo, không thể cập nhật thanh toán.`,
        "error"
      );
      setDialogAction(null);
      setPendingAction(null);
      return;
    }

    const action = dialogAction;
    setPendingAction(action);

    try {
      await updatePayrollPaidStatus.mutateAsync({
        payrollPeriodId,
        userId: employeeId,
        paid: action === "markPaid",
      });
      showToast(
        action === "markPaid"
          ? `Đã đánh dấu đã thanh toán kỳ ${periodLabel}.`
          : `Đã bỏ đánh dấu thanh toán kỳ ${periodLabel}.`,
        "success"
      );
    } catch (error) {
      console.error(error);
      showToast(
        action === "markPaid"
          ? "Không thể đánh dấu đã thanh toán, vui lòng kiểm tra trạng thái xác nhận."
          : "Không thể bỏ đánh dấu thanh toán, vui lòng thử lại.",
        "error"
      );
    } finally {
      setDialogAction(null);
      setPendingAction(null);
    }
  };

  return (
    <>
      <div className="flex w-full flex-col items-center gap-3">
        {hasConfirmed && (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              confirmation?.paid_at
                ? "bg-sky-500/15 text-sky-500"
                : "bg-slate-500/10 text-slate-500"
            }`}
          >
            <FaMoneyBillWave className="mr-2 h-4 w-4" />
            {confirmation?.paid_at ? "Đã thanh toán" : "Chưa thanh toán"}
          </span>
        )}

        {paidTimestamp && (
          <div className="text-xs text-subtle">
            {`Đánh dấu thanh toán lúc ${paidTimestamp}`}
          </div>
        )}

        {hasConfirmed && !confirmation?.paid_at && !isAdmin && (
          <div className="text-xs text-subtle">
            Quản trị viên sẽ đánh dấu thanh toán sau khi xử lý.
          </div>
        )}

        {canMarkPaid && (
          <button
            type="button"
            onClick={() => setDialogAction("markPaid")}
            disabled={disabled}
            className="inline-flex w-full items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updatePayrollPaidStatus.isPending && pendingAction === "markPaid" && (
              <Spinner size="sm" color="white" className="mr-2" />
            )}
            Đánh dấu đã thanh toán
          </button>
        )}

        {canUnmarkPaid && (
          <button
            type="button"
            onClick={() => setDialogAction("unmarkPaid")}
            disabled={disabled}
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-400 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-500/10 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updatePayrollPaidStatus.isPending &&
              pendingAction === "unmarkPaid" && (
              <Spinner size="sm" color="gray" className="mr-2" />
            )}
            Bỏ đánh dấu thanh toán
          </button>
        )}

        {!hasConfirmed && (
          <div className="text-xs text-subtle">
            Nhân viên cần xác nhận trước khi có thể đánh dấu thanh toán.
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        title={
          isMarkingPaid ? "Đánh dấu đã thanh toán" : "Bỏ đánh dấu thanh toán"
        }
        message={
          isMarkingPaid
            ? `Bạn có chắc muốn đánh dấu đã thanh toán kỳ lương ${periodLabel}? Hành động này sẽ được lưu lại với thời gian hiện tại.`
            : `Bạn có chắc muốn bỏ đánh dấu thanh toán cho kỳ lương ${periodLabel}?`
        }
        confirmText={isMarkingPaid ? "Đánh dấu đã thanh toán" : "Bỏ đánh dấu"}
        cancelText="Xem lại"
        actionType={isMarkingPaid ? "success" : "warning"}
        isLoading={updatePayrollPaidStatus.isPending}
        loadingText={isMarkingPaid ? "Đang đánh dấu..." : "Đang bỏ đánh dấu..."}
        onClose={() => {
          if (!updatePayrollPaidStatus.isPending) {
            setDialogAction(null);
            setPendingAction(null);
          }
        }}
        onConfirm={handleDialogConfirm}
      />
    </>
  );
}
