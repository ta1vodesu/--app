import React from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mockCurrentUser } from '@/data/mockData'

export const Header: React.FC = () => {
  return (
    <header className="bg-primary text-primary-foreground border-b border-border sticky top-0 z-40">
      <div className="h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* ロゴ・ブランド */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="text-xl sm:text-2xl leading-none flex-shrink-0">⏱️</div>
          <h1 className="text-base sm:text-lg font-bold truncate">勤怠管理</h1>
          <span className="hidden sm:inline text-xs opacity-75 whitespace-nowrap flex-shrink-0">
            CLAUDE研修 Inc.
          </span>
        </div>

        {/* ユーザーメニュー */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 sm:gap-2 hover:bg-primary/90 px-2 sm:px-3 py-2 rounded-md transition min-w-0">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 bg-primary-foreground flex-shrink-0">
                  <AvatarFallback className="bg-primary-foreground text-primary font-bold text-xs sm:text-sm">
                    {mockCurrentUser.initials || mockCurrentUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs sm:text-sm hidden sm:inline truncate min-w-0">
                  {mockCurrentUser.name}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 sm:w-56">
              <DropdownMenuItem disabled>
                <div className="flex flex-col text-xs sm:text-sm">
                  <span className="font-medium">{mockCurrentUser.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {mockCurrentUser.email}
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs sm:text-sm">プロフィール設定</DropdownMenuItem>
              <DropdownMenuItem className="text-xs sm:text-sm">ログアウト</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

Header.displayName = 'Header'
