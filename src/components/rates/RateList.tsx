import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { HiPlus } from "react-icons/hi2";
import { useRates } from "../../hooks";
import type { Rate } from "../../types";
import { formatMoney } from "../../utils/payrollUtils";
import { Spinner } from "../Spinner";
import { RateForm } from "./RateForm";
import { formatDateDMY } from "../../utils/dateUtils";

export function RateList() {
  const { data: rates = [], isLoading } = useRates();

  const [editingRate, setEditingRate] = useState<Rate | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  const handleEdit = (rate: Rate) => {
    setEditingRate(rate);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingRate(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingRate(null);
    setShowForm(false);
  };

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
          Quản lý mức lương
        </h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
        >
          <HiPlus className="w-4 h-4" />
          Thêm mức lương
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-subtle bg-surface shadow-lg shadow-black/5">
        <ul>
          {rates.map((rate, index) => (
            <li
              key={rate.id}
              className={`px-6 py-4 ${index < rates.length - 1 ? "border-b border-subtle" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary">
                    {rate.activity?.name}
                  </h3>
                  <div className="mt-1 text-sm text-subtle">
                    <span className="font-medium">
                      {formatMoney(rate.hourly_vnd)}/giờ
                    </span>
                    {" • "}
                    <span>
                      Có hiệu lực từ:{" "}
                      {formatDateDMY(new Date(rate.effective_from))}
                    </span>
                    {rate.effective_to && (
                      <>
                        {" • "}
                        <span>
                          Đến:{" "}{formatDateDMY(new Date(rate.effective_to))}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(rate)}
                  aria-label="Chỉnh sửa mức lương"
                  className="rounded-md p-1 text-muted transition hover:bg-surface-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {(showForm || editingRate) && (
        <RateForm rate={editingRate} onClose={handleCloseForm} />
      )}
    </div>
  );
}
