import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageTitle } from "../components/PageTitle";
import { LockedBanner } from "../components/shift-registration/LockedBanner";
import { RegistrationGrid } from "../components/shift-registration/RegistrationGrid";
import { SummaryBar } from "../components/shift-registration/SummaryBar";
import { Spinner } from "../components/Spinner";
import type { ShiftTemplate } from "../constants/shifts";
import { isAdmin, isEmployee } from "../constants/userRoles";
import {
  useAuth,
  useShiftRegistrationBoard,
  useShiftRegistrationMutations,
  useShiftRegistrations,
  useToast,
} from "../hooks";
import { formatDateLocal, getNextWeekMondayVN } from "../utils/dateUtils";
import { slotKey } from "../utils/shiftRegistrationUtils";

function hasSelectionChanged(
  selectedSlots: Set<string>,
  savedKeys: Set<string>,
): boolean {
  if (selectedSlots.size !== savedKeys.size) return true;
  return [...selectedSlots].some((k) => !savedKeys.has(k));
}

export function ShiftRegistrationPage() {
  const { user } = useAuth();

  const weekStart = useMemo(() => getNextWeekMondayVN(), []);

  const { data: registrations = [], isLoading: isLoadingRegs } =
    useShiftRegistrations(weekStart);
  const { data: board, isLoading: isLoadingBoard } =
    useShiftRegistrationBoard(weekStart);
  const { submit, toggleLock } = useShiftRegistrationMutations();
  const { showSuccess, showError } = useToast();

  const isLocked = board?.is_locked ?? false;
  const isEmployeeUser = isEmployee(user?.role);
  const isAdminUser = isAdmin(user?.role);
  const isReadOnly = isLocked || !isEmployeeUser;

  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  // Track whether the user has manually toggled any cell this session.
  // While false, keep selectedSlots in sync with server data so that
  // existing registrations are always pre-selected on page load (including
  // after a query invalidation that briefly returns stale/empty data).
  const dirtyRef = useRef(false);
  useEffect(() => {
    if (isLoadingRegs || !user || dirtyRef.current) return;
    const myKeys = registrations
      .filter((r) => r.user_id === user.id)
      .map((r) => slotKey(r.day_date, r.shift_template));
    setSelectedSlots(new Set(myKeys));
  }, [isLoadingRegs, registrations, user]);

  const handleToggle = useCallback((key: string) => {
    dirtyRef.current = true;
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  async function handleSubmit() {
    if (!user) return;
    const slots = Array.from(selectedSlots).map((key) => {
      const [dayDate, shiftTemplate] = key.split("_");
      return {
        day_date: dayDate,
        shift_template: shiftTemplate as ShiftTemplate,
      };
    });
    try {
      await submit.mutateAsync({ weekStart, userId: user.id, slots });
      showSuccess("Đăng ký ca thành công");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    }
  }

  async function handleToggleLock() {
    try {
      await toggleLock.mutateAsync({ weekStart, currentlyLocked: isLocked });
      showSuccess(
        isLocked ? "Đã mở khoá bảng đăng ký" : "Đã khoá bảng đăng ký",
      );
    } catch (err) {
      showError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    }
  }

  const savedKeys = new Set(
    registrations
      .filter((r) => r.user_id === user?.id)
      .map((r) => slotKey(r.day_date, r.shift_template)),
  );
  const isDirty = hasSelectionChanged(selectedSlots, savedKeys);

  const isLoading = isLoadingRegs || isLoadingBoard;

  if (!user) return null;

  // User pill: show name + role label
  const roleLabel = isAdminUser ? "Quản lý" : "Nhân viên";

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 px-4 py-6 pb-24 sm:px-0">
        <PageTitle
          title="Đăng ký ca"
          subtitle={`Tuần ${formatDateLocal(new Date(weekStart + "T00:00:00"))}`}
        />

        {/* user pill */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-subtle bg-surface px-3 py-1 text-xs text-primary">
          <span className="font-semibold">{user.name}</span>
          <span className="text-muted">·</span>
          <span className="text-muted">{roleLabel}</span>
        </div>

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
              onToggle={handleToggle}
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
        onSubmit={handleSubmit}
        onToggleLock={handleToggleLock}
      />
    </div>
  );
}
