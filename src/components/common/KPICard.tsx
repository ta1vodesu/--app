import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface KPICardProps {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'attention'
  icon?: string
}

export const KPICard: React.FC<KPICardProps> = ({ label, value, trend, icon }) => {
  const trendColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    attention: 'text-yellow-600',
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-xs font-medium ${trendColor[trend]}`}>
              {trend === 'up' && '📈 上昇傾向'}
              {trend === 'down' && '📉 下降傾向'}
              {trend === 'attention' && '⚠️ 要確認'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

KPICard.displayName = 'KPICard'
