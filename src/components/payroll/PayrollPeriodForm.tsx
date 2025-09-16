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
    <div className="mb-4 p-3 bg-gray-50 rounded-md">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newPeriod}
          onChange={(e) => setNewPeriod(e.target.value)}
          placeholder="YYYY-MM (ví dụ: 2025-01)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        <button
          onClick={handleCreatePeriod}
          disabled={createPeriod.isPending}
          className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {createPeriod.isPending ? "Đang tạo..." : "Tạo"}
        </button>
        <button
          onClick={() => {
            onCancel();
            setNewPeriod("");
          }}
          className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
