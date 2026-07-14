import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { BottomNavigation } from './BottomNavigation'

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        {/* サイドバー: md以上で表示、またはモバイルで開いている場合 */}
        <div className={`${
          isSidebarOpen ? 'block' : 'hidden'
        } md:block w-64 transition-all duration-300 ease-in-out`}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-y-auto bg-gray-50 pb-24 md:pb-0">
          <div className="px-3 sm:px-4 py-4 sm:py-6 max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ボトムナビゲーション: md未満で表示 */}
      <BottomNavigation />

      {/* モバイルでサイドバーが開いている場合のオーバーレイ */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden z-30 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}

AppLayout.displayName = 'AppLayout'
