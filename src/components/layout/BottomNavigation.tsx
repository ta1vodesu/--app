import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { navigationItems } from '@/data/mockData'

export const BottomNavigation: React.FC = () => {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex h-24 md:hidden z-50 shadow-lg">
      <div className="flex w-full items-center justify-around px-1 py-1">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 gap-1 py-1 px-0.5 rounded-lg text-center',
                isActive
                  ? 'text-primary bg-blue-100'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
              title={item.label}
            >
              <span className="text-xl leading-none">{item.icon || '•'}</span>
              <span className="text-[10px] font-medium leading-tight text-center line-clamp-2 w-full">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

BottomNavigation.displayName = 'BottomNavigation'
