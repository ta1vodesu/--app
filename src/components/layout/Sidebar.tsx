import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { sidebarNavigationItems } from '@/data/mockData'
import { useAuth } from '@/context/AuthContext'
import { UserRole } from '@/types'

interface SidebarProps {
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation()
  const { userProfile } = useAuth()

  const isAdmin = userProfile?.role === UserRole.ADMIN
  const visibleItems = sidebarNavigationItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 overflow-y-auto flex flex-col shadow-sm">
      {/* メニュー部分 */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 min-w-0',
                isActive
                  ? 'bg-blue-100 text-primary border border-primary/40'
                  : 'text-gray-700 hover:bg-gray-50 border border-transparent'
              )}
              title={item.label}
            >
              <item.icon className="h-4 w-4 flex-shrink-0 opacity-80" />
              <span className="truncate min-w-0 font-medium">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* 下部セクション */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">勤怠管理</span>
          <span className="text-xs font-medium text-gray-400">v0.1.0</span>
        </div>
        <div className="h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
      </div>
    </aside>
  )
}

Sidebar.displayName = 'Sidebar'
