import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { generalNavigationItems, adminNavigationItems, NavItem } from '@/data/mockData'
import { useAuth } from '@/context/AuthContext'
import { UserRole } from '@/types'

interface SidebarProps {
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation()
  const { userProfile } = useAuth()

  const isAdmin = userProfile?.role === UserRole.ADMIN

  const renderItem = (item: NavItem) => {
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
        <span className="text-base leading-none flex-shrink-0 opacity-80">・</span>
        <span className="truncate min-w-0 font-medium">{item.label}</span>
      </NavLink>
    )
  }

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 overflow-y-auto flex flex-col shadow-sm">
      <nav className="flex-1 px-3 py-4 space-y-4">
        {/* 一般メニュー */}
        <div>
          <p className="px-3 pb-2 text-xs font-semibold text-gray-400 tracking-wider">メニュー</p>
          <div className="space-y-1">{generalNavigationItems.map(renderItem)}</div>
        </div>

        {/* 管理者専用メニュー */}
        {isAdmin && (
          <div className="pt-3 border-t border-gray-200">
            <p className="px-3 pb-2 text-xs font-semibold text-gray-400 tracking-wider">管理者</p>
            <div className="space-y-1">{adminNavigationItems.map(renderItem)}</div>
          </div>
        )}
      </nav>
    </aside>
  )
}

Sidebar.displayName = 'Sidebar'
