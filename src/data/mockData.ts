import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  FileEdit,
  CheckSquare,
  BarChart3,
  Settings,
} from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  adminOnly?: boolean
}

// サイドバーのナビゲーションメニュー
export const sidebarNavigationItems: NavItem[] = [
  { label: 'ダッシュボード', path: '/', icon: LayoutDashboard },
  { label: '打刻', path: '/checkin', icon: Clock },
  { label: '勤怠一覧', path: '/attendance', icon: CalendarDays },
  { label: '修正申請', path: '/correction', icon: FileEdit },
  { label: '承認待ち', path: '/approvals', icon: CheckSquare, adminOnly: true },
  { label: 'レポート', path: '/report', icon: BarChart3 },
  { label: 'アカウント設定', path: '/account-settings', icon: Settings },
]
