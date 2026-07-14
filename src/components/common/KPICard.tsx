import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface KPICardProps {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'attention'
}

export const KPICard: React.FC<KPICardProps> = ({ label, value, trend }) => {
  const trendColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    attention: 'text-yellow-600',
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trendColor[trend]}`}>
              {trend === 'up' ? '↑ 上昇' : trend === 'down' ? '↓ 下降' : '注意'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

KPICard.displayName = 'KPICard'
