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

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  departmentId: string
  avatar?: string
  initials?: string
}

export interface Department {
  id: string
  name: string
  managerId: string
}

export interface Attendance {
  id: string
  userId: string
  date: string
  checkInTime?: string
  checkOutTime?: string
  workingHours?: string
  status: AttendanceStatus
}

export interface CorrectionRequest {
  id: string
  userId: string
  userName: string
  userInitials?: string
  attendanceDate: string
  originalCheckIn?: string
  correctedCheckIn?: string
  originalCheckOut?: string
  correctedCheckOut?: string
  reason: string
  status: RequestStatus
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
