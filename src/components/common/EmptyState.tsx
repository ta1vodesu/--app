import React from 'react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
      <div className="text-5xl sm:text-6xl mb-4">{icon}</div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm sm:text-base text-gray-600 text-center max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="default">
          {action.label}
        </Button>
      )}
    </div>
  )
}

EmptyState.displayName = 'EmptyState'
