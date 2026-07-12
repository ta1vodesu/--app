import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { sidebarNavigationItems } from '@/data/mockData'

export const Sidebar: React.FC = () => {
  const location = useLocation()

  return (
    <aside className="w-64 bg-gray-50 border-r border-border h-[calc(100vh-4rem)] overflow-y-auto sticky top-16 flex flex-col">
      <nav className="p-4 space-y-1 flex-1">
        {sidebarNavigationItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors min-w-0',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
              title={item.label}
            >
              <span className="text-lg leading-none flex-shrink-0">{item.icon}</span>
              <span className="truncate min-w-0">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* サイドバーの下部に境界線を追加 */}
      <div className="border-t border-border px-4 py-3 text-xs text-gray-500">
        v0.1.0
      </div>
    </aside>
  )
}

Sidebar.displayName = 'Sidebar'
