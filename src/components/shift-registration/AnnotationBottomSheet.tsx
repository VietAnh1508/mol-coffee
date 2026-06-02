import { useEffect, useState } from 'react';
import type { ShiftTemplate } from '../../constants/shifts';
import { SHIFT_TEMPLATES } from '../../constants/shifts';
import type { ShiftRegistration, SlotAnnotation } from '../../types';
import { UserAvatar } from '../UserAvatar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dayLabel: string;
  template: ShiftTemplate;
  // Employee edit mode
  annotation: SlotAnnotation;
  onSave: (annotation: SlotAnnotation) => void;
  onClear: () => void;
  // Admin/supervisor inspect mode
  readOnly?: boolean;
  registrations?: ShiftRegistration[];
}

export function AnnotationBottomSheet({
  isOpen,
  onClose,
  dayLabel,
  template,
  annotation,
  onSave,
  onClear,
  readOnly = false,
  registrations = [],
}: Props) {
  const shift = SHIFT_TEMPLATES[template];

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [note, setNote] = useState('');

  // Sync local state whenever the sheet opens or the annotation changes.
  // Fall back to the shift window boundaries so inputs are never blank.
  useEffect(() => {
    if (isOpen && !readOnly) {
      setStartTime(annotation.customStartTime ?? shift.start);
      setEndTime(annotation.customEndTime ?? shift.end);
      setNote(annotation.note ?? '');
    }
  }, [isOpen, readOnly, annotation, shift.start, shift.end]);

  if (!isOpen) return null;

  const timeError =
    startTime && endTime && endTime <= startTime
      ? 'Giờ về phải sau Giờ đến'
      : null;

  function handleSave() {
    onSave({
      customStartTime:
        startTime && startTime !== shift.start ? startTime : null,
      customEndTime: endTime && endTime !== shift.end ? endTime : null,
      note: note.trim() || null,
    });
    onClose();
  }

  function handleClear() {
    onClear();
    onClose();
  }

  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* slide-up sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-surface px-4 pb-8 pt-4 shadow-xl">
        {/* handle bar */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-subtle" />

        {/* header */}
        <h2 className="mb-4 text-sm font-semibold text-primary">
          {dayLabel} · {shift.label} · {shift.start}–{shift.end}
        </h2>

        {readOnly ? (
          /* Admin/supervisor inspect mode */
          <div className="mb-6 space-y-4">
            {registrations.length === 0 ? (
              <p className="text-sm text-muted">Chưa có ai đăng ký ca này</p>
            ) : (
              registrations.map((r) => (
                <div key={r.id} className="flex items-start gap-3">
                  <UserAvatar
                    name={r.user?.name ?? ''}
                    avatarUrl={r.user?.avatar_url}
                    userId={r.user_id}
                    size="md"
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-primary">
                      {r.user?.name}
                    </p>
                    {(r.custom_start_time || r.custom_end_time) && (
                      <p className="mt-0.5 text-xs text-muted">
                        Giờ đến:{' '}
                        {r.custom_start_time?.slice(0, 5) ?? shift.start} · Giờ
                        về: {r.custom_end_time?.slice(0, 5) ?? shift.end}
                      </p>
                    )}
                    {r.note && (
                      <p className="mt-0.5 text-xs text-muted">{r.note}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Employee edit mode */
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-primary">
                  Giờ đến
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  min={shift.start}
                  max={shift.end}
                  className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-primary">
                  Giờ về
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min={shift.start}
                  max={shift.end}
                  className="w-full rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {timeError && <p className="text-xs text-red-500">{timeError}</p>}

            <div>
              <label className="mb-1 block text-xs font-medium text-primary">
                Ghi chú
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="Vd: đến muộn do đi học..."
                className="w-full resize-none rounded-lg border border-subtle bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-0.5 text-right text-[11px] text-muted">
                {note.length}/200
              </p>
            </div>
          </div>
        )}

        {/* action buttons */}
        <div className="flex gap-2">
          {readOnly ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-subtle px-3 py-2.5 text-sm font-medium text-primary"
            >
              Đóng
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 rounded-lg border border-subtle px-3 py-2.5 text-sm font-medium text-primary"
              >
                Xoá ghi chú
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!!timeError}
                className="flex-1 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                Lưu
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
