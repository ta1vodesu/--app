import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { navigationItems } from '@/data/mockData'

export const BottomNavigation: React.FC = () => {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border flex h-16 md:hidden z-50">
      {navigationItems.map((item) => {
        const isActive = location.pathname === item.path
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full transition-colors gap-1 py-1 px-1',
              isActive
                ? 'text-primary border-t-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            )}
            title={item.label}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-[10px] font-medium leading-tight text-center truncate w-full">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

BottomNavigation.displayName = 'BottomNavigation'
