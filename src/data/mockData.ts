import { UserRole, AttendanceStatus, RequestStatus, User, KPI, MemberStatus, Attendance, CorrectionRequest } from '@/types'

export const mockCurrentUser: User = {
  id: 'user-001',
  name: '山田課長',
  email: 'yamada@example.com',
  role: UserRole.MANAGER,
  departmentId: 'dept-001',
  avatar: '🧑‍💼',
  initials: 'Y',
}

export const mockKPI: KPI = {
  attendanceRate: 96.2,
  averageWorkingHours: '8h12m',
  pendingApprovals: 3,
  overtimeHours: 12.5,
}

export const mockMembers: MemberStatus[] = [
  {
    id: 'emp-001',
    name: '田中太郎',
    initials: 'T',
    status: AttendanceStatus.WORKING,
    checkInTime: '09:02',
    checkOutTime: '18:15',
    workingHours: '8h13m',
    overtime: '2.5h',
  },
  {
    id: 'emp-002',
    name: '鈴木花子',
    initials: 'S',
    status: AttendanceStatus.WORKING,
    checkInTime: '08:58',
    checkOutTime: '18:30',
    workingHours: '8h32m',
    overtime: '4.0h',
  },
  {
    id: 'emp-003',
    name: '佐藤一郎',
    initials: 'S',
    status: AttendanceStatus.HOLIDAY,
    workingHours: '-',
    overtime: '1.5h',
  },
  {
    id: 'emp-004',
    name: '高橋美咲',
    initials: 'T',
    status: AttendanceStatus.WORKING,
    checkInTime: '09:05',
    checkOutTime: '17:50',
    workingHours: '8h45m',
    overtime: '4.5h',
  },
]

export const mockAttendances: Attendance[] = [
  {
    id: 'att-001',
    userId: 'user-001',
    date: '2026-03-16',
    status: AttendanceStatus.HOLIDAY,
  },
  {
    id: 'att-002',
    userId: 'user-001',
    date: '2026-03-15',
    status: AttendanceStatus.HOLIDAY,
  },
  {
    id: 'att-003',
    userId: 'user-001',
    date: '2026-03-14',
    checkInTime: '09:02',
    checkOutTime: '18:15',
    workingHours: '8h13m',
    status: AttendanceStatus.WORKING,
  },
  {
    id: 'att-004',
    userId: 'user-001',
    date: '2026-03-13',
    checkInTime: '08:58',
    checkOutTime: '18:30',
    workingHours: '8h32m',
    status: AttendanceStatus.WORKING,
  },
  {
    id: 'att-005',
    userId: 'user-001',
    date: '2026-03-12',
    checkInTime: '09:10',
    checkOutTime: '18:05',
    workingHours: '7h55m',
    status: AttendanceStatus.WORKING,
  },
  {
    id: 'att-006',
    userId: 'user-001',
    date: '2026-03-11',
    status: AttendanceStatus.HOLIDAY,
  },
  {
    id: 'att-007',
    userId: 'user-001',
    date: '2026-03-10',
    checkInTime: '09:05',
    checkOutTime: '17:50',
    workingHours: '8h45m',
    status: AttendanceStatus.WORKING,
  },
  {
    id: 'att-008',
    userId: 'user-001',
    date: '2026-03-09',
    status: AttendanceStatus.HOLIDAY,
  },
]

export const mockApprovals: CorrectionRequest[] = [
  {
    id: 'req-001',
    userId: 'emp-001',
    userName: '田中太郎',
    attendanceDate: '2026-03-14',
    originalCheckIn: '09:02',
    correctedCheckIn: '08:55',
    originalCheckOut: '18:15',
    correctedCheckOut: '18:55',
    reason: '打刻機の不具合',
    status: RequestStatus.PENDING,
    userInitials: 'T',
  },
  {
    id: 'req-002',
    userId: 'emp-002',
    userName: '鈴木花子',
    attendanceDate: '2026-03-12',
    originalCheckOut: '18:30',
    correctedCheckOut: '18:00',
    reason: '退勤打刻忘れ',
    status: RequestStatus.PENDING,
    userInitials: 'S',
  },
  {
    id: 'req-003',
    userId: 'emp-003',
    userName: '佐藤一郎',
    attendanceDate: '2026-03-10',
    originalCheckIn: '09:15',
    correctedCheckIn: '09:00',
    originalCheckOut: '09:00',
    correctedCheckOut: '17:00',
    reason: '電車遅延',
    status: RequestStatus.PENDING,
    userInitials: 'S',
  },
]

// ボトムナビゲーション用（モバイル）
export const navigationItems = [
  { label: 'ダッシュボード', path: '/', icon: '📊' },
  { label: '打刻', path: '/checkin', icon: '⏱️' },
  { label: '勤怠一覧', path: '/attendance', icon: '📋' },
  { label: '修正申請', path: '/correction', icon: '✏️' },
  { label: '承認待ち', path: '/approvals', icon: '✅' },
  { label: 'レポート', path: '/report', icon: '📈' },
]

// サイドバー用（デスクトップ）- アカウント管理を追加
export const sidebarNavigationItems = [
  ...navigationItems,
  { label: 'アカウント設定', path: '/account-settings', icon: '⚙️' },
]
