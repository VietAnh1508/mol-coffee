export interface User {
  id: string
  phone: string
  name: string
  role: 'admin' | 'employee'
  status: 'active' | 'inactive'
  auth_user_id: string
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Rate {
  id: string
  activity_id: string
  hourly_vnd: number
  effective_from: string
  effective_to: string | null
  created_at: string
  updated_at: string
  activity?: Activity
}

export interface ScheduleShift {
  id: string
  user_id: string
  activity_id: string
  start_ts: string
  end_ts: string
  template_name: 'morning' | 'afternoon' | 'custom'
  is_manual: boolean
  note?: string
  created_at: string
  updated_at: string
  user?: User
  activity?: Activity
}

export interface TimeEntry {
  id: string
  user_id: string
  activity_id: string
  start_ts: string
  end_ts: string
  source: 'schedule' | 'manual'
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
  user?: User
  activity?: Activity
  approved_by_user?: User
}

export interface PayrollPeriod {
  id: string
  year_month: string
  status: 'open' | 'closed'
  closed_by?: string
  closed_at?: string
  created_at: string
  updated_at: string
  closed_by_user?: User
}