-- Migration: Remove 'custom' from shift_template enum
-- Since there are no custom shifts in the database, we can simply update the enum

-- Step 1: Remove the default constraint first
ALTER TABLE public.schedule_shifts 
ALTER COLUMN template_name DROP DEFAULT;

-- Step 2: Create new enum without 'custom'
CREATE TYPE shift_template_new AS ENUM ('morning', 'afternoon');

-- Step 3: Update the schedule_shifts table to use the new enum
ALTER TABLE public.schedule_shifts 
ALTER COLUMN template_name TYPE shift_template_new 
USING template_name::text::shift_template_new;

-- Step 4: Drop the old enum and rename the new one
DROP TYPE shift_template;
ALTER TYPE shift_template_new RENAME TO shift_template;

-- Step 5: Set the new default value
ALTER TABLE public.schedule_shifts 
ALTER COLUMN template_name SET DEFAULT 'morning'::shift_template;
