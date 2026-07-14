// ロールは admin / member の2種類（RLS ポリシーと一致させる）
export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

// attendances.status に実際に保存される値
export type AttendanceStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'working'
  | 'worked'
  | 'completed'
  | 'holiday'
  | 'absent'

export type CorrectionStatus = 'pending' | 'approved' | 'rejected'

export interface Attendance {
  id: string
  user_id: string
  date: string
  check_in_time?: string | null
  check_out_time?: string | null
  working_hours?: string | null
  break_time?: string | null
  overtime?: string | null
  status: string | null
  created_at?: string
  updated_at?: string
}

export interface Correction {
  id: string
  user_id: string
  attendance_id: string
  original_check_in?: string | null
  corrected_check_in?: string | null
  original_check_out?: string | null
  corrected_check_out?: string | null
  reason: string
  status: CorrectionStatus | string
  approver_id?: string | null
  approved_at?: string | null
  created_at: string
  updated_at?: string
}
