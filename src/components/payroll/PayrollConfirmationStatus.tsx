import { useMemo, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import {
  useConfirmPayrollApproval,
  usePayrollConfirmation,
  useToast,
  useUnconfirmPayrollApproval,
} from "../../hooks";
import { formatDateTime } from "../../utils/dateUtils";
import { formatMonthName } from "../../utils/payrollUtils";
import { ConfirmationDialog } from "../ConfirmationDialog";

interface PayrollConfirmationStatusProps {
  readonly payrollPeriodId: string | null;
  readonly employeeId: string;
  readonly isOwnData: boolean;
  readonly isAdmin: boolean;
  readonly period: string;
}

type DialogAction = "confirm" | "unconfirm" | null;

export function PayrollConfirmationStatus({
  payrollPeriodId,
  employeeId,
  isOwnData,
  isAdmin,
  period,
}: PayrollConfirmationStatusProps) {
  const { showToast } = useToast();
  const [dialogAction, setDialogAction] = useState<DialogAction>(null);

  const { data: confirmation, isLoading } = usePayrollConfirmation(
    payrollPeriodId,
    employeeId
  );
  const confirmPayroll = useConfirmPayrollApproval();
  const unconfirmPayroll = useUnconfirmPayrollApproval();

  const periodLabel = useMemo(() => formatMonthName(period), [period]);
  const confirmationTimestamp = useMemo(() => {
    if (!confirmation) return null;
    return formatDateTime(confirmation.confirmed_at);
  }, [confirmation]);

  const hasConfirmed = Boolean(confirmation);
  const canConfirmPayroll =
    isOwnData && Boolean(payrollPeriodId) && !hasConfirmed;
  const showUnavailableNotice = isOwnData && !payrollPeriodId && !hasConfirmed;
  const disabled =
    isLoading || confirmPayroll.isPending || unconfirmPayroll.isPending;

  const isDialogOpen = dialogAction !== null;
  const isUnconfirming = dialogAction === "unconfirm";

  const handleDialogConfirm = async () => {
    if (dialogAction === "unconfirm") {
      if (!payrollPeriodId) {
        showToast(
          `Kỳ lương ${periodLabel} chưa được tạo, không thể bỏ xác nhận.`,
          "error"
        );
        setDialogAction(null);
        return;
      }

      try {
        await unconfirmPayroll.mutateAsync({
          payrollPeriodId,
          userId: employeeId,
        });
        showToast(`Đã bỏ xác nhận bảng lương kỳ ${periodLabel}.`, "success");
      } catch (error) {
        console.error(error);
        showToast(
          "Không thể bỏ xác nhận bảng lương, vui lòng thử lại.",
          "error"
        );
      } finally {
        setDialogAction(null);
      }
      return;
    }

    if (!payrollPeriodId) {
      showToast(
        `Kỳ lương ${periodLabel} chưa được tạo, không thể xác nhận.`,
        "error"
      );
      setDialogAction(null);
      return;
    }

    try {
      await confirmPayroll.mutateAsync({
        payrollPeriodId,
        userId: employeeId,
      });
      showToast(`Đã xác nhận bảng lương kỳ ${periodLabel}.`, "success");
    } catch (error) {
      console.error(error);
      showToast("Không thể xác nhận bảng lương, vui lòng thử lại.", "error");
    } finally {
      setDialogAction(null);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        {hasConfirmed ? (
          <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-500">
            <FaCheckCircle className="mr-2 h-4 w-4" />
            Đã xác nhận
          </span>
        ) : showUnavailableNotice ? (
          <span className="inline-flex items-center rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-500">
            Kỳ lương chưa sẵn sàng để xác nhận
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-500">
            Chưa xác nhận
          </span>
        )}

        {confirmationTimestamp && (
          <div className="text-xs text-subtle">
            {isOwnData
              ? `Bạn đã xác nhận lúc ${confirmationTimestamp}`
              : `Xác nhận lúc ${confirmationTimestamp}`}
          </div>
        )}

        {canConfirmPayroll && (
          <button
            type="button"
            onClick={() => setDialogAction("confirm")}
            disabled={disabled}
            className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirmPayroll.isPending
              ? "Đang xác nhận..."
              : "Tôi xác nhận bảng lương này"}
          </button>
        )}

        {hasConfirmed && isAdmin && (
          <button
            type="button"
            onClick={() => setDialogAction("unconfirm")}
            disabled={disabled}
            className="inline-flex items-center rounded-xl border border-rose-500 px-4 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-500/10 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            {unconfirmPayroll.isPending ? "Đang bỏ xác nhận..." : "Bỏ xác nhận"}
          </button>
        )}
      </div>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        title={
          isUnconfirming ? "Bỏ xác nhận bảng lương" : "Xác nhận bảng lương"
        }
        message={
          isUnconfirming
            ? `Bạn có chắc muốn bỏ xác nhận bảng lương kỳ ${periodLabel}? Nhân viên sẽ cần xác nhận lại sau khi điều chỉnh.`
            : `Bạn xác nhận các số liệu kỳ lương ${periodLabel} là chính xác?`
        }
        confirmText={isUnconfirming ? "Bỏ xác nhận" : "Tôi đồng ý"}
        cancelText="Xem lại"
        actionType={isUnconfirming ? "warning" : "success"}
        isLoading={confirmPayroll.isPending || unconfirmPayroll.isPending}
        loadingText={
          isUnconfirming ? "Đang bỏ xác nhận..." : "Đang xác nhận..."
        }
        onClose={() => {
          if (!confirmPayroll.isPending && !unconfirmPayroll.isPending) {
            setDialogAction(null);
          }
        }}
        onConfirm={handleDialogConfirm}
      />
    </>
  );
}
