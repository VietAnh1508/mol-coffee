-- Migration: Payroll Period Lock Enforcement
-- Description: Adds database-level triggers to prevent schedule modifications when payroll periods are closed
-- Created: 2025-10-02
-- Security Fix: Checks BOTH old and new dates on UPDATE to prevent moving shifts out of locked periods

-- Function to check if a schedule shift falls within a closed payroll period
-- This provides defense-in-depth protection against schedule modifications
CREATE OR REPLACE FUNCTION check_schedule_shift_period_lock()
RETURNS TRIGGER AS $$
DECLARE
  v_year_month_old TEXT;
  v_year_month_new TEXT;
  v_period_status payroll_status;
  v_offset_minutes INTEGER := 420; -- UTC+7 for Vietnam timezone
BEGIN
  -- For UPDATE operations: Check BOTH the old and new periods
  IF TG_OP = 'UPDATE' THEN
    -- Check if the ORIGINAL shift is in a locked period
    -- This prevents moving a shift OUT OF a locked period
    v_year_month_old := TO_CHAR(
      (OLD.start_ts AT TIME ZONE 'UTC') + (v_offset_minutes || ' minutes')::INTERVAL,
      'YYYY-MM'
    );

    SELECT status INTO v_period_status
    FROM payroll_periods
    WHERE year_month = v_year_month_old;

    IF v_period_status = 'closed' THEN
      RAISE EXCEPTION 'Không thể chỉnh sửa ca làm việc trong kỳ lương đã khóa (%). Vui lòng mở lại kỳ lương trước khi thay đổi.', v_year_month_old
        USING ERRCODE = 'P0001';
    END IF;

    -- Check if the NEW shift date is in a locked period
    -- This prevents moving a shift INTO a locked period
    v_year_month_new := TO_CHAR(
      (NEW.start_ts AT TIME ZONE 'UTC') + (v_offset_minutes || ' minutes')::INTERVAL,
      'YYYY-MM'
    );

    -- Only check new period if the date has changed
    IF v_year_month_old <> v_year_month_new THEN
      SELECT status INTO v_period_status
      FROM payroll_periods
      WHERE year_month = v_year_month_new;

      IF v_period_status = 'closed' THEN
        RAISE EXCEPTION 'Không thể chuyển ca làm việc vào kỳ lương đã khóa (%). Vui lòng mở lại kỳ lương trước khi thay đổi.', v_year_month_new
          USING ERRCODE = 'P0001';
      END IF;
    END IF;
  END IF;

  -- For INSERT operations: Check the new shift's period
  IF TG_OP = 'INSERT' THEN
    v_year_month_new := TO_CHAR(
      (NEW.start_ts AT TIME ZONE 'UTC') + (v_offset_minutes || ' minutes')::INTERVAL,
      'YYYY-MM'
    );

    SELECT status INTO v_period_status
    FROM payroll_periods
    WHERE year_month = v_year_month_new;

    IF v_period_status = 'closed' THEN
      RAISE EXCEPTION 'Không thể thêm ca làm việc trong kỳ lương đã khóa (%)', v_year_month_new
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  -- If no period exists or it's open, allow the operation
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check period lock before DELETE operations
-- DELETE operations don't have NEW record, so we need a separate function
CREATE OR REPLACE FUNCTION check_schedule_shift_period_lock_delete()
RETURNS TRIGGER AS $$
DECLARE
  v_year_month TEXT;
  v_period_status payroll_status;
  v_offset_minutes INTEGER := 420; -- UTC+7 for Vietnam timezone
BEGIN
  -- Extract YYYY-MM from the shift's start_ts, adjusted to Vietnam timezone
  v_year_month := TO_CHAR(
    (OLD.start_ts AT TIME ZONE 'UTC') + (v_offset_minutes || ' minutes')::INTERVAL,
    'YYYY-MM'
  );

  -- Check if a payroll period exists for this month and if it's closed
  SELECT status INTO v_period_status
  FROM payroll_periods
  WHERE year_month = v_year_month;

  -- If a period exists and is closed, prevent the deletion
  IF v_period_status = 'closed' THEN
    RAISE EXCEPTION 'Không thể xóa ca làm việc trong kỳ lương đã khóa (%)', v_year_month
      USING ERRCODE = 'P0001';
  END IF;

  -- If no period exists or it's open, allow the deletion
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger for INSERT and UPDATE operations
DROP TRIGGER IF EXISTS schedule_shift_period_lock_check ON schedule_shifts;
CREATE TRIGGER schedule_shift_period_lock_check
  BEFORE INSERT OR UPDATE ON schedule_shifts
  FOR EACH ROW
  EXECUTE FUNCTION check_schedule_shift_period_lock();

-- Apply trigger for DELETE operations
DROP TRIGGER IF EXISTS schedule_shift_period_lock_check_delete ON schedule_shifts;
CREATE TRIGGER schedule_shift_period_lock_check_delete
  BEFORE DELETE ON schedule_shifts
  FOR EACH ROW
  EXECUTE FUNCTION check_schedule_shift_period_lock_delete();

-- Add comment to document the triggers
COMMENT ON TRIGGER schedule_shift_period_lock_check ON schedule_shifts IS
  'Prevents modifications to schedule shifts when the payroll period is closed. Checks both original and new dates on UPDATE to prevent moving shifts out of or into locked periods.';

COMMENT ON TRIGGER schedule_shift_period_lock_check_delete ON schedule_shifts IS
  'Prevents deletion of schedule shifts when the payroll period is closed';
