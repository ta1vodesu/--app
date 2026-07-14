export interface NavItem {
  label: string
  path: string
  adminOnly?: boolean
}

// サイドバーのナビゲーションメニュー
export const sidebarNavigationItems: NavItem[] = [
  { label: 'ダッシュボード', path: '/' },
  { label: '打刻', path: '/checkin' },
  { label: '勤怠一覧', path: '/attendance' },
  { label: '修正申請', path: '/correction' },
  { label: '承認待ち', path: '/approvals', adminOnly: true },
  { label: 'レポート', path: '/report' },
  { label: 'アカウント設定', path: '/account-settings' },
]
