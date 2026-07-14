// ナビゲーションメニュー（定数データ）
export const navigationItems = [
  { label: 'ダッシュボード', path: '/', icon: '' },
  { label: '打刻', path: '/checkin', icon: '' },
  { label: '勤怠一覧', path: '/attendance', icon: '' },
  { label: '修正申請', path: '/correction', icon: '' },
  { label: '承認待ち', path: '/approvals', icon: '' },
  { label: 'レポート', path: '/report', icon: '' },
]

export const sidebarNavigationItems = [
  ...navigationItems,
  { label: 'アカウント設定', path: '/account-settings', icon: '' },
]
