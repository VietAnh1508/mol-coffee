import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageTitle } from '../components/PageTitle';
import { AnnotationBottomSheet } from '../components/shift-registration/AnnotationBottomSheet';
import { LockedBanner } from '../components/shift-registration/LockedBanner';
import { RegistrationGrid } from '../components/shift-registration/RegistrationGrid';
import { SummaryBar } from '../components/shift-registration/SummaryBar';
import { WeekNavigator } from '../components/shift-registration/WeekNavigator';
import { Spinner } from '../components/Spinner';
import type { ShiftTemplate } from '../constants/shifts';
import {
  canAccessManagement,
  getRoleLabel,
  isAdmin,
  isEmployee,
} from '../constants/userRoles';
import { useAuth } from '../hooks/useAuth';
import { useShiftRegistrationBoard } from '../hooks/useShiftRegistrationBoard';
import { useShiftRegistrationMutations } from '../hooks/useShiftRegistrationMutations';
import { useShiftRegistrations } from '../hooks/useShiftRegistrations';
import { useToast } from '../hooks/useToast';
import { useActiveUsers } from '../hooks/useUsers';
import type { SlotAnnotation } from '../types';
import { formatDateLocal, getNextWeekMondayVN } from '../utils/dateUtils';
import { getDayLabel, slotKey } from '../utils/shiftRegistrationUtils';

const EMPTY_ANNOTATION: SlotAnnotation = {
  customStartTime: null,
  customEndTime: null,
  note: null,
};

function hasSelectionChanged(
  selectedSlots: Map<string, SlotAnnotation>,
  registrations: {
    user_id: string;
    day_date: string;
    shift_template: string;
    custom_start_time: string | null;
    custom_end_time: string | null;
    note: string | null;
  }[],
  userId: string,
): boolean {
  const mine = registrations.filter((r) => r.user_id === userId);
  if (selectedSlots.size !== mine.length) return true;

  for (const [key, annotation] of selectedSlots) {
    const [dayDate, template] = key.split('_');
    const saved = mine.find(
      (r) => r.day_date === dayDate && r.shift_template === template,
    );
    if (!saved) return true;
    if (
      annotation.customStartTime !==
      (saved.custom_start_time ? saved.custom_start_time.slice(0, 5) : null)
    )
      return true;
    if (
      annotation.customEndTime !==
      (saved.custom_end_time ? saved.custom_end_time.slice(0, 5) : null)
    )
      return true;
    if (annotation.note !== (saved.note ?? null)) return true;
  }
  return false;
}

export function ShiftRegistrationPage() {
  const { user } = useAuth();

  const nextWeek = useMemo(() => getNextWeekMondayVN(), []);
  const isEmployeeUser = isEmployee(user?.role);
  const isAdminUser = isAdmin(user?.role);
  const canNavigateWeeks = canAccessManagement(user?.role);

  // Employees are pinned to next week; admin/supervisor can navigate freely.
  const [weekStart, setWeekStart] = useState(nextWeek);

  const { data: registrations = [], isLoading: isLoadingRegs } =
    useShiftRegistrations(weekStart);
  const { data: board, isLoading: isLoadingBoard } =
    useShiftRegistrationBoard(weekStart);
  const { data: allUsers = [] } = useActiveUsers();
  const { submit, toggleLock, deleteBoard } = useShiftRegistrationMutations();
  const { showSuccess, showError } = useToast();

  const isLocked = board?.is_locked ?? false;
  const isReadOnly = isLocked || !isEmployeeUser;

  const activeEmployeeCount = allUsers.filter((u) => isEmployee(u.role)).length;
  const registeredEmployeeCount = new Set(registrations.map((r) => r.user_id))
    .size;

  const [selectedSlots, setSelectedSlots] = useState<
    Map<string, SlotAnnotation>
  >(new Map());
  const [inspectKey, setInspectKey] = useState<string | null>(null);

  const dirtyRef = useRef(false);

  // Reset selections when the viewed week changes — must run before the
  // server-sync effect so dirtyRef is false when new data arrives.
  useEffect(() => {
    dirtyRef.current = false;
    setSelectedSlots(new Map());
  }, [weekStart]);

  // While false, keep selectedSlots in sync with server data so that
  // existing registrations are always pre-selected on page load (including
  // after a query invalidation that briefly returns stale/empty data).
  useEffect(() => {
    if (isLoadingRegs || !user || dirtyRef.current) return;
    const map = new Map<string, SlotAnnotation>();
    registrations
      .filter((r) => r.user_id === user.id)
      .forEach((r) => {
        map.set(slotKey(r.day_date, r.shift_template), {
          customStartTime: r.custom_start_time
            ? r.custom_start_time.slice(0, 5)
            : null,
          customEndTime: r.custom_end_time
            ? r.custom_end_time.slice(0, 5)
            : null,
          note: r.note ?? null,
        });
      });
    setSelectedSlots(map);
  }, [isLoadingRegs, registrations, user]);

  const handleToggle = useCallback((key: string) => {
    dirtyRef.current = true;
    setSelectedSlots((prev) => {
      const next = new Map(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.set(key, { ...EMPTY_ANNOTATION });
      }
      return next;
    });
  }, []);

  const handleDeselect = useCallback((key: string) => {
    dirtyRef.current = true;
    setSelectedSlots((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const handleSaveAnnotation = useCallback(
    (key: string, annotation: SlotAnnotation) => {
      dirtyRef.current = true;
      setSelectedSlots((prev) => {
        const next = new Map(prev);
        next.set(key, annotation);
        return next;
      });
    },
    [],
  );

  const handleClearAnnotation = useCallback((key: string) => {
    dirtyRef.current = true;
    setSelectedSlots((prev) => {
      const next = new Map(prev);
      next.set(key, { ...EMPTY_ANNOTATION });
      return next;
    });
  }, []);

  const handleInspect = useCallback((key: string) => {
    setInspectKey(key);
  }, []);

  async function handleSubmit() {
    if (!user) return;
    const slots = Array.from(selectedSlots.entries()).map(
      ([key, annotation]) => {
        const [dayDate, shiftTemplate] = key.split('_');
        return {
          day_date: dayDate,
          shift_template: shiftTemplate as ShiftTemplate,
          custom_start_time: annotation.customStartTime,
          custom_end_time: annotation.customEndTime,
          note: annotation.note,
        };
      },
    );
    try {
      await submit.mutateAsync({ weekStart, userId: user.id, slots });
      showSuccess('Đăng ký ca thành công');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    }
  }

  async function handleToggleLock() {
    try {
      await toggleLock.mutateAsync({ weekStart, currentlyLocked: isLocked });
      showSuccess(
        isLocked ? 'Đã mở khoá bảng đăng ký' : 'Đã khoá bảng đăng ký',
      );
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    }
  }

  async function handleDeleteBoard() {
    try {
      await deleteBoard.mutateAsync({ weekStart });
      showSuccess('Đã xoá bảng đăng ký ca');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    }
  }

  const isDirty = user
    ? hasSelectionChanged(selectedSlots, registrations, user.id)
    : false;

  const isLoading = isLoadingRegs || isLoadingBoard;

  if (!user) return null;

  // Inspect mode: derive slot details for the AnnotationBottomSheet
  let inspectDayLabel = '';
  let inspectTemplate: ShiftTemplate = 'morning';
  let inspectRegistrations = registrations;
  if (inspectKey) {
    const idx = inspectKey.lastIndexOf('_');
    const dayDate = inspectKey.slice(0, idx);
    inspectTemplate = inspectKey.slice(idx + 1) as ShiftTemplate;
    inspectDayLabel = getDayLabel(new Date(dayDate + 'T00:00:00'));
    inspectRegistrations = registrations.filter(
      (r) => r.day_date === dayDate && r.shift_template === inspectTemplate,
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 px-4 py-6 pb-24 sm:px-0">
        <PageTitle
          title="Đăng ký ca"
          subtitle={`Tuần ${formatDateLocal(new Date(weekStart + 'T00:00:00'))}`}
        />

        {/* user pill */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-subtle bg-surface px-3 py-1 text-xs text-primary">
          <span className="font-semibold">{user.name}</span>
          <span className="text-muted">·</span>
          <span className="text-muted">{getRoleLabel(user.role)}</span>
        </div>

        {/* week navigator — admin/supervisor only */}
        {canNavigateWeeks && (
          <WeekNavigator
            weekStart={weekStart}
            nextWeek={nextWeek}
            isAdmin={isAdminUser}
            isDeleting={deleteBoard.isPending}
            onWeekChange={setWeekStart}
            onDeleteConfirm={handleDeleteBoard}
          />
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-4">
            {isLocked && (
              <LockedBanner lockedByName={board?.locked_by_user?.name} />
            )}
            <RegistrationGrid
              weekStart={weekStart}
              registrations={registrations}
              selectedSlots={selectedSlots}
              isReadOnly={isReadOnly}
              currentUserId={user.id}
              onToggle={handleToggle}
              {...(!isEmployeeUser ? { onInspect: handleInspect } : {})}
            />
          </div>
        )}
      </div>

      <SummaryBar
        selectedSlots={selectedSlots}
        isReadOnly={isReadOnly}
        isAdmin={isAdminUser}
        isLocked={isLocked}
        isDirty={isDirty}
        isSubmitting={submit.isPending}
        isTogglingLock={toggleLock.isPending}
        allRegistrations={registrations}
        registeredEmployeeCount={registeredEmployeeCount}
        activeEmployeeCount={activeEmployeeCount}
        onSubmit={handleSubmit}
        onToggleLock={handleToggleLock}
        onDeselect={handleDeselect}
        onSaveAnnotation={handleSaveAnnotation}
        onClearAnnotation={handleClearAnnotation}
      />

      {/* admin/supervisor inspect bottom sheet */}
      {inspectKey && (
        <AnnotationBottomSheet
          isOpen
          onClose={() => setInspectKey(null)}
          dayLabel={inspectDayLabel}
          template={inspectTemplate}
          annotation={EMPTY_ANNOTATION}
          onSave={() => {}}
          onClear={() => {}}
          readOnly
          registrations={inspectRegistrations}
        />
      )}
    </div>
  );
}
