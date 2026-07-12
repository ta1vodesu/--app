export enum UserRole {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

export enum AttendanceStatus {
  WORKING = 'working',
  HOLIDAY = 'holiday',
  ABSENT = 'absent',
  PENDING = 'pending',
}

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum LeaveType {
  PAID = 'paid',
  UNPAID = 'unpaid',
  SICK = 'sick',
  PERSONAL = 'personal',
}

// Supabase Database Types
export interface Profile {
  id: string
  email: string
  name: string
  department_id?: string
  position?: string
  phone?: string
  initials?: string
  role: UserRole
  join_date?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  departmentId?: string
  position?: string
  phone?: string
  avatar?: string
  initials?: string
}

export interface Department {
  id: string
  name: string
  manager_id?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: string
  user_id: string
  date: string
  check_in_time?: string
  check_out_time?: string
  working_hours?: string
  break_time?: string
  overtime?: string
  status: AttendanceStatus
  notes?: string
  created_at: string
  updated_at: string
  // For backwards compatibility
  userId?: string
  checkInTime?: string
  checkOutTime?: string
  workingHours?: string
}

export interface CorrectionRequest {
  id: string
  user_id: string
  attendance_id: string
  original_check_in?: string
  corrected_check_in?: string
  original_check_out?: string
  corrected_check_out?: string
  reason: string
  status: RequestStatus
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
  updated_at: string
  // For backwards compatibility
  userId?: string
  userName?: string
  userInitials?: string
  attendanceDate?: string
  originalCheckIn?: string
  correctedCheckIn?: string
  originalCheckOut?: string
  correctedCheckOut?: string
}

export interface Approval {
  id: string
  correction_request_id: string
  approver_id: string
  status: RequestStatus
  approval_note?: string
  approved_at?: string
  created_at: string
  updated_at: string
}

export interface Leave {
  id: string
  user_id: string
  date: string
  leave_type: LeaveType
  reason?: string
  status: RequestStatus
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
}

export interface LeaveBalance {
  id: string
  user_id: string
  year: number
  paid_leave_total: number
  paid_leave_used: number
  sick_leave_total: number
  sick_leave_used: number
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id?: string
  action: string
  table_name?: string
  record_id?: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface KPI {
  attendanceRate: number
  averageWorkingHours: string
  pendingApprovals: number
  overtimeHours: number
}

export interface MemberStatus {
  id: string
  name: string
  initials?: string
  status: AttendanceStatus
  checkInTime?: string
  checkOutTime?: string
  workingHours?: string
  overtime?: string
}
