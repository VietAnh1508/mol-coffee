import { useState } from "react";
import { FaCopy, FaLock, FaLockOpen } from "react-icons/fa";
import type { ShiftTemplate } from "../../constants/shifts";
import { SHIFT_TEMPLATES } from "../../constants/shifts";
import type { ShiftRegistration, SlotAnnotation } from "../../types";
import {
  buildExportText,
  getDayLabel,
  hasAnnotation,
} from "../../utils/shiftRegistrationUtils";
import { ClockIcon } from "../ClockIcon";
import { AnnotationBottomSheet } from "./AnnotationBottomSheet";

function parseSlotKey(key: string): {
  dayDate: string;
  template: ShiftTemplate;
} {
  const idx = key.lastIndexOf("_");
  return {
    dayDate: key.slice(0, idx),
    template: key.slice(idx + 1) as ShiftTemplate,
  };
}

function slotChipLabel(key: string): string {
  const { dayDate, template } = parseSlotKey(key);
  const date = new Date(dayDate + "T00:00:00");
  return `${getDayLabel(date)} ${SHIFT_TEMPLATES[template].label}`;
}

interface Props {
  selectedSlots: Map<string, SlotAnnotation>;
  isDirty: boolean;
  isReadOnly: boolean;
  isAdmin: boolean;
  isLocked: boolean;
  isSubmitting: boolean;
  isTogglingLock: boolean;
  allRegistrations?: ShiftRegistration[];
  onSubmit: () => void;
  onToggleLock: () => void;
  onDeselect: (key: string) => void;
  onSaveAnnotation: (key: string, annotation: SlotAnnotation) => void;
  onClearAnnotation: (key: string) => void;
}

export function SummaryBar({
  selectedSlots,
  isDirty,
  isReadOnly,
  isAdmin,
  isLocked,
  isSubmitting,
  isTogglingLock,
  allRegistrations,
  onSubmit,
  onToggleLock,
  onDeselect,
  onSaveAnnotation,
  onClearAnnotation,
}: Props) {
  const count = selectedSlots.size;
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeAnnotation: SlotAnnotation = activeKey
    ? (selectedSlots.get(activeKey) ?? {
        customStartTime: null,
        customEndTime: null,
        note: null,
      })
    : { customStartTime: null, customEndTime: null, note: null };

  const activeTemplate = activeKey
    ? parseSlotKey(activeKey).template
    : "morning";
  const activeDayDate = activeKey ? parseSlotKey(activeKey).dayDate : "";
  const activeDayLabel = activeDayDate
    ? getDayLabel(new Date(activeDayDate + "T00:00:00"))
    : "";

  const sortedEntries = [...selectedSlots.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  return (
    <>
      <div className="bg-surface sticky bottom-0 z-40 border-t border-subtle px-4 py-3">
        {/* employee chip strip */}
        {!isReadOnly && count > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {sortedEntries.map(([key, annotation]) => {
              const annotated = hasAnnotation(annotation);
              return (
                <div
                  key={key}
                  className="flex shrink-0 items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 pl-3 pr-2 py-1.5"
                >
                  <button
                    type="button"
                    onClick={() => setActiveKey(key)}
                    className="flex items-center gap-1 text-xs font-medium text-indigo-800"
                  >
                    {annotated && <ClockIcon className="h-3 w-3" />}
                    {slotChipLabel(key)}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeselect(key)}
                    aria-label="Bỏ chọn"
                    className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-indigo-500 hover:bg-indigo-100 hover:text-indigo-700"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* slot count — employees only */}
          {!isReadOnly ? (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-primary">
                {count > 0 ? `${count} ca đã chọn` : "Chưa chọn ca nào"}
              </p>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* admin copy export */}
          {isAdmin && allRegistrations && allRegistrations.length > 0 && (
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(
                  buildExportText(allRegistrations),
                );
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-subtle px-3 py-2 text-xs font-medium text-primary"
            >
              <FaCopy className="h-3.5 w-3.5" />
              {copied ? "✓ Đã copy" : "Copy"}
            </button>
          )}

          {/* admin lock/unlock */}
          {isAdmin && (
            <button
              type="button"
              onClick={onToggleLock}
              disabled={isTogglingLock}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-subtle px-3 py-2 text-xs font-medium text-primary disabled:opacity-50"
            >
              {isTogglingLock ? (
                "..."
              ) : isLocked ? (
                <>
                  <FaLockOpen className="h-3.5 w-3.5" />
                  Mở khoá
                </>
              ) : (
                <>
                  <FaLock className="h-3.5 w-3.5" />
                  Khoá
                </>
              )}
            </button>
          )}

          {/* employee submit */}
          {!isReadOnly && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!isDirty || isSubmitting}
              className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
            >
              {isSubmitting ? "Đang lưu..." : "Đăng ký"}
            </button>
          )}
        </div>
      </div>

      {/* annotation bottom sheet — employee edit mode */}
      {activeKey && (
        <AnnotationBottomSheet
          isOpen={!!activeKey}
          onClose={() => setActiveKey(null)}
          dayLabel={activeDayLabel}
          template={activeTemplate}
          annotation={activeAnnotation}
          onSave={(a) => {
            onSaveAnnotation(activeKey, a);
            setActiveKey(null);
          }}
          onClear={() => {
            onClearAnnotation(activeKey);
            setActiveKey(null);
          }}
        />
      )}
    </>
  );
}
