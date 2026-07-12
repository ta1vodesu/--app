import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface KpiCardProps {
  label: string
  value: string | number
  suffix?: string
  trend?: number
  color?: 'blue' | 'green' | 'orange' | 'red'
}

const colorMap = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  orange: 'text-orange-600',
  red: 'text-red-600',
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  suffix,
  trend,
  color = 'blue',
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3 sm:pt-6">
        <div className="space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm text-gray-600 truncate">{label}</p>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className={`text-2xl sm:text-4xl font-bold ${colorMap[color]} truncate`}>
              {value}
            </span>
            {suffix && <span className="text-xs sm:text-base text-gray-600 flex-shrink-0">{suffix}</span>}
          </div>
          {trend !== undefined && (
            <p className="text-xs text-gray-500">
              前月比 {trend > 0 ? '+' : ''}{trend}%
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

KpiCard.displayName = 'KpiCard'
