import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { BottomNavigation } from './BottomNavigation'

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        {/* モバイルでドロワーが開いている場合のオーバーレイ（ヘッダーより下を覆う） */}
        {isSidebarOpen && (
          <div
            className="fixed left-0 right-0 bottom-0 top-14 sm:top-16 z-[60] bg-black/30 md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* サイドバー: モバイルはドロワー（コンテンツに重ねる）、md以上は常時表示 */}
        <div
          className={`fixed left-0 bottom-0 top-14 sm:top-16 z-[70] w-64 flex-shrink-0 transform transition-transform duration-300 ease-in-out md:static md:z-auto md:h-full md:translate-x-0 md:transition-none ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar onClose={closeSidebar} />
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
    </div>
  )
}

AppLayout.displayName = 'AppLayout'
