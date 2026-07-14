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

export enum CorrectionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Supabase Database Types

export interface Profile {
  id: string
  email: string
  name: string
  role: UserRole
  department_id?: string
  is_active: boolean
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
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
}

export interface Correction {
  id: string
  user_id: string
  attendance_id: string
  original_check_in?: string
  corrected_check_in?: string
  original_check_out?: string
  corrected_check_out?: string
  reason: string
  status: CorrectionStatus
  approver_id?: string
  approval_note?: string
  approved_at?: string
  created_at: string
  updated_at: string
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
