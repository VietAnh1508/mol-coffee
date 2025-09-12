import { useEffect, useRef, useState } from "react";
import { HiCalendarDays } from "react-icons/hi2";
import { formatDate } from "../utils/dateUtils";

interface DateNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateNavigation({
  selectedDate,
  onDateChange,
}: DateNavigationProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showDatePicker]);

  const handleDateInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newDate = new Date(event.target.value);
    onDateChange(newDate);
    setShowDatePicker(false);
  };

  const goToPreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    onDateChange(prevDay);
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    onDateChange(nextDay);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={goToPreviousDay}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          ←
        </button>

        <div className="text-center relative" ref={datePickerRef}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            <span>{formatDate(selectedDate)}</span>
            <HiCalendarDays className="h-5 w-5" />
          </button>

          {/* Date Picker Dropdown */}
          {showDatePicker && (
            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-md shadow-lg z-10">
              <input
                type="date"
                value={selectedDate.toISOString().split("T")[0]}
                onChange={handleDateInputChange}
                className="p-3 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <button
          onClick={goToNextDay}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          →
        </button>
      </div>

      <button
        onClick={goToToday}
        className="w-full mt-3 text-blue-500 hover:text-blue-600 text-sm"
      >
        Hôm nay
      </button>
    </div>
  );
}
