import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface MonthNavigatorProps {
  selectedDate: Date
  onMonthChange: (date: Date) => void
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  selectedDate,
  onMonthChange,
}) => {
  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() - 1)
    onMonthChange(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() + 1)
    onMonthChange(newDate)
  }

  const handleToday = () => {
    onMonthChange(new Date())
  }

  const yearMonth = selectedDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
  })

  const isCurrentMonth =
    new Date().getMonth() === selectedDate.getMonth() &&
    new Date().getFullYear() === selectedDate.getFullYear()

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex justify-center">
          <Button
            variant={isCurrentMonth ? "outline" : "secondary"}
            size="sm"
            onClick={handleToday}
            className="w-20"
          >
            今月
          </Button>
        </div>
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="w-24"
          >
            ← 前月
          </Button>

          <div className="flex-1 text-center">
            <p className="text-base sm:text-lg font-semibold text-gray-900">
              {yearMonth}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="w-24"
          >
            次月 →
          </Button>
        </div>
      </div>
    </Card>
  )
}

MonthNavigator.displayName = 'MonthNavigator'
