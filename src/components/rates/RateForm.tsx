import { useState } from 'react';
import { useActivities } from '../../hooks/useActivities';
import { useRates } from '../../hooks/useRates';
import { useCreateRate, useUpdateRate } from '../../hooks/useRateMutations';
import type { Rate } from '../../types';
import { getFirstOfNextMonth, getTomorrow } from '../../utils/dateUtils';

export type RateFormMode = 'create' | 'schedule-change' | 'edit-future';

interface RateFormProps {
  mode: RateFormMode;
  rate?: Rate | null;
  onClose: () => void;
}

const TITLES: Record<RateFormMode, string> = {
  create: 'Thêm mức lương mới',
  'schedule-change': 'Lên lịch thay đổi mức lương',
  'edit-future': 'Sửa mức lương sắp áp dụng',
};

export function RateForm({ mode, rate, onClose }: RateFormProps) {
  const { data: activities = [] } = useActivities();
  const { data: rates = [] } = useRates();
  const createRateMutation = useCreateRate();
  const updateRateMutation = useUpdateRate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      if (mode === 'schedule-change' && rate) {
        const hourlyVnd = parseInt(formData.get('hourly_vnd') as string);
        const effectiveFrom = formData.get('effective_from') as string;

        const closing = new Date(effectiveFrom);
        closing.setDate(closing.getDate() - 1);
        const effectiveTo = closing.toISOString().split('T')[0];

        await updateRateMutation.mutateAsync({
          id: rate.id,
          effective_to: effectiveTo,
        });
        await createRateMutation.mutateAsync({
          activity_id: rate.activity_id,
          hourly_vnd: hourlyVnd,
          effective_from: effectiveFrom,
        });
      } else if (mode === 'edit-future' && rate) {
        const activityId = formData.get('activity_id') as string;
        const hourlyVnd = parseInt(formData.get('hourly_vnd') as string);
        const effectiveFrom = formData.get('effective_from') as string;
        const effectiveToRaw = formData.get('effective_to') as string;

        await updateRateMutation.mutateAsync({
          id: rate.id,
          activity_id: activityId,
          hourly_vnd: hourlyVnd,
          effective_from: effectiveFrom,
          effective_to: effectiveToRaw || null,
        });
      } else {
        const activityId = formData.get('activity_id') as string;
        const hourlyVnd = parseInt(formData.get('hourly_vnd') as string);
        const effectiveFrom = formData.get('effective_from') as string;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existingOpenRate = rates.find(
          (r) =>
            r.activity_id === activityId &&
            r.effective_to === null &&
            new Date(r.effective_from) <= today &&
            new Date(r.effective_from) < new Date(effectiveFrom),
        );
        if (existingOpenRate) {
          const closing = new Date(effectiveFrom);
          closing.setDate(closing.getDate() - 1);
          await updateRateMutation.mutateAsync({
            id: existingOpenRate.id,
            effective_to: closing.toISOString().split('T')[0],
          });
        }

        await createRateMutation.mutateAsync({
          activity_id: activityId,
          hourly_vnd: hourlyVnd,
          effective_from: effectiveFrom,
        });
      }

      onClose();
    } catch {
      alert(
        mode === 'create'
          ? 'Lỗi khi tạo mức lương'
          : 'Lỗi khi cập nhật mức lương',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-subtle bg-surface p-6 shadow-2xl shadow-black/25">
        <h3 className="text-xl font-semibold text-primary">{TITLES[mode]}</h3>
        <form
          className="mt-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(new FormData(e.target as HTMLFormElement));
          }}
        >
          {/* Activity */}
          {mode === 'schedule-change' ? (
            <div>
              <p className="mb-2 text-sm font-medium text-subtle">Hoạt động</p>
              <p className="rounded-xl border border-subtle bg-surface-muted px-4 py-3 text-sm text-primary">
                {rate?.activity?.name}
              </p>
            </div>
          ) : (
            <div>
              <label
                htmlFor="rate-activity"
                className="mb-2 block text-sm font-medium text-subtle"
              >
                Hoạt động
              </label>
              <select
                id="rate-activity"
                name="activity_id"
                required
                defaultValue={
                  mode === 'edit-future' ? (rate?.activity_id ?? '') : ''
                }
                className="w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm text-primary shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
              >
                <option value="">Chọn hoạt động</option>
                {activities
                  .filter((a) => a.is_active)
                  .map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Hourly rate */}
          <div>
            <label
              htmlFor="rate-hourly"
              className="mb-2 block text-sm font-medium text-subtle"
            >
              Mức lương theo giờ (VND)
            </label>
            <input
              id="rate-hourly"
              type="number"
              name="hourly_vnd"
              required
              min="0"
              step="1000"
              defaultValue={mode !== 'create' ? (rate?.hourly_vnd ?? '') : ''}
              className="w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm text-primary placeholder-subtle shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
              placeholder="Ví dụ: 35000"
            />
          </div>

          {/* Effective from */}
          <div>
            <label
              htmlFor="rate-effective-from"
              className="mb-2 block text-sm font-medium text-subtle"
            >
              Có hiệu lực từ
            </label>
            <input
              id="rate-effective-from"
              type="date"
              name="effective_from"
              required
              min={mode === 'schedule-change' ? getTomorrow() : undefined}
              defaultValue={
                mode === 'schedule-change'
                  ? getFirstOfNextMonth()
                  : mode === 'edit-future' && rate
                    ? new Date(rate.effective_from).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]
              }
              className="w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm text-primary shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
            />
          </div>

          {/* Effective to (edit-future only) */}
          {mode === 'edit-future' && (
            <div>
              <label
                htmlFor="rate-effective-to"
                className="mb-2 block text-sm font-medium text-subtle"
              >
                Hết hiệu lực{' '}
                <span className="font-normal text-muted">(tuỳ chọn)</span>
              </label>
              <input
                id="rate-effective-to"
                type="date"
                name="effective_to"
                defaultValue={
                  rate?.effective_to
                    ? new Date(rate.effective_to).toISOString().split('T')[0]
                    : ''
                }
                className="w-full rounded-xl border border-subtle bg-surface px-4 py-3 text-sm text-primary shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
              />
            </div>
          )}

          {mode === 'schedule-change' && (
            <p className="rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
              Mức lương hiện tại sẽ tự động kết thúc vào ngày trước ngày hiệu
              lực mới.
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-subtle px-4 py-2 text-sm font-semibold text-subtle transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-surface"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
