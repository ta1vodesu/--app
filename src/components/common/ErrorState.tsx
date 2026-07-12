import React from 'react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  message: string
  icon?: string
  onRetry?: () => void
  showRetryButton?: boolean
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'エラーが発生しました',
  message,
  icon = '❌',
  onRetry,
  showRetryButton = !!onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 text-center max-w-md mb-6">
        {message}
      </p>
      {showRetryButton && onRetry && (
        <Button onClick={onRetry} className="gap-2">
          🔄 もう一度試す
        </Button>
      )}
    </div>
  )
}

ErrorState.displayName = 'ErrorState'
