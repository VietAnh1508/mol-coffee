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
    <div className="mb-6 rounded-2xl border border-subtle bg-surface p-4 shadow-lg shadow-black/5">
      <div className="flex items-center justify-between">
        <button
          onClick={goToPreviousDay}
          className="rounded-full p-2 text-muted transition hover:bg-surface-muted hover:text-primary"
        >
          ←
        </button>

        <div className="text-center relative" ref={datePickerRef}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center space-x-2 text-lg font-semibold text-primary transition hover:text-blue-400"
          >
            <span>{formatDate(selectedDate)}</span>
            <HiCalendarDays className="h-5 w-5" />
          </button>

          {/* Date Picker Dropdown */}
          {showDatePicker && (
            <div className="absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-xl border border-subtle bg-surface shadow-lg shadow-black/15">
              <input
                type="date"
                value={selectedDate.toISOString().split("T")[0]}
                onChange={handleDateInputChange}
                className="w-full rounded-xl border-0 bg-transparent px-4 py-3 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          )}
        </div>

        <button
          onClick={goToNextDay}
          className="rounded-full p-2 text-muted transition hover:bg-surface-muted hover:text-primary"
        >
          →
        </button>
      </div>

      <button
        onClick={goToToday}
        className="mt-3 w-full text-sm font-semibold text-blue-400 transition hover:text-blue-300"
      >
        Hôm nay
      </button>
    </div>
  );
}
