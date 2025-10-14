import { useState } from "react";
import { useCreatePayrollPeriod, useToast } from "../../hooks";

interface PayrollPeriodFormProps {
  onSuccess: (yearMonth: string) => void;
  onCancel: () => void;
}

export function PayrollPeriodForm({ onSuccess, onCancel }: PayrollPeriodFormProps) {
  const [newPeriod, setNewPeriod] = useState("");
  const createPeriod = useCreatePayrollPeriod();
  const { showToast } = useToast();

  const handleCreatePeriod = async () => {
    if (!newPeriod.match(/^\d{4}-\d{2}$/)) {
      showToast("Định dạng kỳ lương không hợp lệ. Sử dụng định dạng YYYY-MM", "error");
      return;
    }

    try {
      await createPeriod.mutateAsync({ year_month: newPeriod });
      showToast("Tạo kỳ lương thành công", "success");
      setNewPeriod("");
      onSuccess(newPeriod);
    } catch (error) {
      console.log(error);
      showToast("Không thể tạo kỳ lương", "error");
    }
  };

  return (
    <div className="mb-4 rounded-xl border border-subtle bg-surface-muted p-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newPeriod}
          onChange={(e) => setNewPeriod(e.target.value)}
          placeholder="YYYY-MM (ví dụ: 2025-01)"
          className="flex-1 rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
        />
        <button
          onClick={handleCreatePeriod}
          disabled={createPeriod.isPending}
          className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createPeriod.isPending ? "Đang tạo..." : "Tạo"}
        </button>
        <button
          onClick={() => {
            onCancel();
            setNewPeriod("");
          }}
          className="rounded-xl border border-subtle px-3 py-2 text-sm font-semibold text-subtle transition hover:bg-surface focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-surface"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
