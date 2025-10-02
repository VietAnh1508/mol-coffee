// Supabase error codes
// Reference: https://postgrest.org/en/stable/errors.html

/**
 * PostgreSQL error code returned when no rows are found in a query.
 * This is returned by Supabase when using .single() or .maybeSingle()
 * and the query returns zero rows.
 */
export const SUPABASE_ERROR_CODE_NO_ROWS = 'PGRST116';
