-- Migration: Add Supervisor role with read-only management access
-- Description: Extends user_role enum, updates triggers, and broadens read policies to include supervisors
-- Created: 2025-11-08

-- Add 'supervisor' to user_role enum if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'supervisor'
      AND enumtypid = 'user_role'::regtype
  ) THEN
    ALTER TYPE user_role ADD VALUE 'supervisor';
  END IF;
END$$;
