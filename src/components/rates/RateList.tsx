import { useState } from "react";
import { HiPencil, HiPlus } from "react-icons/hi2";
import { useRates } from "../../hooks";
import type { Rate } from "../../types";
import { RateForm } from "./RateForm";

export function RateList() {
  const { data: rates = [], isLoading } = useRates();

  const [editingRate, setEditingRate] = useState<Rate | null>(null);
  const [showForm, setShowForm] = useState(false);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Quản lý mức lương
        </h2>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
        >
          <HiPlus className="w-4 h-4" />
          Thêm mức lương
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {rates.map((rate) => (
            <li key={rate.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {rate.activity?.name}
                  </h3>
                  <div className="mt-1 text-sm text-gray-600">
                    <span className="font-medium">
                      {rate.hourly_vnd.toLocaleString("vi-VN")} VND/giờ
                    </span>
                    {" • "}
                    <span>
                      Có hiệu lực từ:{" "}
                      {new Date(rate.effective_from).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                    {rate.effective_to && (
                      <>
                        {" • "}
                        <span>
                          Đến:{" "}
                          {new Date(rate.effective_to).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(rate)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center gap-1"
                >
                  <HiPencil className="w-4 h-4" />
                  Sửa
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
