-- Adjust shift limit check to use Asia/Ho_Chi_Minh business day
CREATE OR REPLACE FUNCTION check_shift_overlap()
RETURNS TRIGGER AS $$
DECLARE
    new_shift_local_date DATE := (NEW.start_ts AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE;
BEGIN
    -- Check for overlapping shifts for the same user
    IF EXISTS (
        SELECT 1
        FROM public.schedule_shifts
        WHERE user_id = NEW.user_id
          AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
          AND (
              (NEW.start_ts >= start_ts AND NEW.start_ts < end_ts) OR
              (NEW.end_ts > start_ts AND NEW.end_ts <= end_ts) OR
              (NEW.start_ts <= start_ts AND NEW.end_ts >= end_ts)
          )
    ) THEN
        RAISE EXCEPTION 'Shift overlaps with existing shift for this user';
    END IF;

    -- Check maximum 2 shifts per local business day per user (Asia/Ho_Chi_Minh)
    IF (
        SELECT COUNT(*)
        FROM public.schedule_shifts
        WHERE user_id = NEW.user_id
          AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
          AND (start_ts AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE = new_shift_local_date
    ) >= 2 THEN
        RAISE EXCEPTION 'Maximum 2 shifts per day per user exceeded';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger remains attached
DROP TRIGGER IF EXISTS check_shift_overlap_trigger ON public.schedule_shifts;
CREATE TRIGGER check_shift_overlap_trigger
    BEFORE INSERT OR UPDATE ON public.schedule_shifts
    FOR EACH ROW EXECUTE FUNCTION check_shift_overlap();
