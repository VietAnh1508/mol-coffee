Coffee Shop Employee Scheduling & Payroll Web App (PWA)

1. Project Overview

Goal:
Build a mobile-first Progressive Web App (PWA) to manage scheduling, timekeeping, and payroll for coffee shop employees. The system should be optimized for mobile (no native installs), simple, and enforce strict role-based access.

User Roles:
	•	Admin (Manager/Owner):
		•	Full CRUD on users, schedules, activities, rates, and timekeeping.
		•	Can view salary data for all employees.
	•	Employee (Staff):
		•	Registers via email + password (minimal signup).
		•	Completes profile with name + phone on first login.
		•	Can view all employees' schedules but only their own salary data (read-only).
		•	Cannot modify any schedule shifts (view-only access to schedules).

Branching:
Single branch only (no multi-location support in MVP).

⸻

2. Features Breakdown

Authentication
	•	Progressive registration flow:
		•	Initial signup: email (unique) + password only.
		•	Profile completion: name + phone required on first login.
		•	Vietnamese mobile phone validation (10 digits, 03/05/07/08/09 prefixes).
	•	Login with email + password.
	•	Change password (self-service).
	•	Phone number required for admin contact purposes.
	•	Admin accounts seeded manually in DB.
	•	Security: bcrypt/argon2 password hashing, HTTPS, brute-force throttling.

Role-Based Access Control (RBAC)
	•	Admin: Full CRUD.
	•	Employee: Read-only (own data only).
	•	Salary visibility:
	•	Admin → all employees.
	•	Employee → self only.

Settings (Admin only)
	•	Manage activities (e.g., Coffee, Bread).
	•	Assign activity-based hourly rates with effective dating.

Employee List (Admin only)
	•	View all employees.
	•	Promote/demote to admin.
	•	Deactivate employees (delete feature temporarily removed for security).

Scheduling
	•	Default shifts per day:
		•	Morning: 06:00–12:00
		•	Afternoon: 12:00–18:00
	•	Rules:
		•	Max 2 shifts/day/employee.
		•	No overlaps per employee.
		•	Activities cannot change mid-shift.
		•	Admin can manually adjust times (late arrival, early leave).
	•	UI: Day view calendar.
		•	Admin: multiple columns (employees) with full modification rights.
		•	Employee: can view all employees' schedules but cannot modify any shifts.
	•	Conflict handling: Prevent overlaps, enforce 2-shift max.

Timekeeping (Simplified)
	•	Schedules serve as actual work records.
	•	Admins edit schedules directly for late arrivals/early departures.
	•	Schedule shifts form the basis of salary calculation.

Payroll & Salary
	•	Monthly totals calculated directly from schedule shifts (read-only for both roles).
	•	Hours by activity from scheduled work.
	•	Subtotals = scheduled hours × effective rate.
	•	Final monthly salary (VND).
	•	Daily breakdown for transparency.
	•	Admin can close/reopen payroll periods.
	•	Period locking prevents schedule changes after payroll finalization.
	•	Export CSV.

⸻

3. Technical Requirements

Tech Stack
	•	Frontend: React + Tailwind CSS, PWA-enabled, Supabase client.
	•	Backend/DB: Supabase (Postgres + Auth + RLS).
	•	Auth Strategy:
	•	Direct email authentication with Supabase.
	•	Progressive profile completion with ProfileCompletionModal.
	•	Users sign up with email + password, complete profile on first login.
	•	Phone numbers required with Vietnamese mobile validation.
	•	Placeholder phone system during registration process.
	•	Hosting: Vercel (FE) + Supabase cloud.

Database Schema (MVP)
	•	users (id, email, phone [required], name, role, status, auth_user_id)
	•	activities (id, name, is_active)
	•	rates (id, activity_id, hourly_vnd, effective_from, effective_to)
	•	schedule_shifts (id, user_id, activity_id, start_ts, end_ts, template_name, is_manual, note) - serves as both schedule and actual work record
	•	payroll_periods (id, year_month, status, closed_by, closed_at) - manages payroll period locking

Data Privacy (via Supabase RLS)
	•	Employees: can SELECT all shifts and colleagues' basic info (name, email, phone) for schedule coordination, but only their own salary totals.
	•	Admins: unrestricted CRUD on all data.
	•	Rates/activities: read-only for employees; full access for admins.
	•	Email used for authentication and primary user identification.
	•	Phone numbers required for admin contact purposes (Vietnamese mobile format).

⸻

4. Key Business Rules
	1.	Employees can only register as Employees.
	2.	No overlapping shifts per employee per day.
	3.	Max 2 shifts per day per employee.
	4.	Activities fixed per shift; cannot change mid-shift.
	5.	Salary = sum(scheduled hours × applicable rate per activity).
	6.	Payroll is locked once a period is closed (reopen requires admin action).
	7.	Admins cannot demote themselves or deactivate their own accounts to prevent system lockout scenarios. The last remaining admin cannot be demoted to ensure system manageability.

⸻

5. Data Access Control
	•	Role-based access control enforced at database level
	•	Employee schedule coordination: employees can view colleagues' schedules and basic info (name, email, phone)
	•	Employee data privacy: employees can only view their own salary and time entry data
	•	Admin oversight: administrators can access all system data including roles and status
	•	Data privacy: unauthorized access prevented even with direct database queries
	•	Secure authentication with email as primary identifier
	•	Phone numbers stored as supplementary contact information

⸻

6. Acceptance Criteria (MVP)
	•	Employees can view all schedules but only their own salary data.
	•	Admins can view and manage all data.
	•	Two-shift max per day enforced.
	•	Overlap prevention works.
	•	Activity immutability enforced.
	•	Salary totals match CSV export.
	•	RLS ensures privacy even if users bypass the frontend.

⸻

7. Roadmap
	•	Phase 1 (MVP): Auth, RBAC, Settings, Employee list, Scheduling.
	•	Phase 2: Schedule-based Payroll, Monthly Salary Calculations, CSV export, Payroll period management.
	•	Phase 3: Hardening (rate effective-dating UI, PWA polish, offline shell).
	•	Future: Multi-branch, employee self clock-in/out, notifications, shift swaps, advanced timekeeping.