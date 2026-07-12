import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { BottomNavigation } from './BottomNavigation'

export const AppLayout: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* サイドバー: md以上で表示 */}
        <div className="hidden md:block w-1/3 max-w-xs border-r border-border">
          <Sidebar />
        </div>

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ボトムナビゲーション: md未満で表示 */}
      <BottomNavigation />
    </div>
  )
}

AppLayout.displayName = 'AppLayout'
