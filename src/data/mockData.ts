export interface NavItem {
  label: string
  path: string
}

// 一般メニュー（全ユーザー共通）
export const generalNavigationItems: NavItem[] = [
  { label: 'ダッシュボード', path: '/' },
  { label: '打刻', path: '/checkin' },
  { label: '勤怠一覧', path: '/attendance' },
  { label: '修正申請', path: '/correction' },
  { label: 'レポート', path: '/report' },
  { label: 'アカウント設定', path: '/account-settings' },
]

// 管理者専用メニュー
export const adminNavigationItems: NavItem[] = [
  { label: '承認管理', path: '/approvals' },
]
