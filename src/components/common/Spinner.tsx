import React from 'react'
import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  fullScreen?: boolean
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  label = 'ローディング中...',
  fullScreen = false,
}) => {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={cn(
          'border-4 border-gray-200 border-t-primary rounded-full animate-spin',
          sizeMap[size]
        )}
      />
      {label && <p className="text-sm text-gray-600">{label}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {spinnerContent}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-8 sm:py-12">
      {spinnerContent}
    </div>
  )
}

Spinner.displayName = 'Spinner'
