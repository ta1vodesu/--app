import React from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { AttendanceStatus } from '@/types'
import '@/styles/calendar.css'

interface AttendanceRecord {
  date: string
  status: AttendanceStatus
}

interface AttendanceCalendarProps {
  attendances: AttendanceRecord[]
  selectedDate?: any
  onDateSelect?: (value: any) => void
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  attendances,
  selectedDate,
  onDateSelect,
}) => {
  const getDateStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const record = attendances.find((a) => a.date === dateStr)
    return record?.status
  }

  const getTileClassName = (date: Date) => {
    const status = getDateStatus(date)

    switch (status) {
      case AttendanceStatus.WORKING:
        return 'attendance-working'
      case AttendanceStatus.HOLIDAY:
        return 'attendance-holiday'
      case AttendanceStatus.PENDING:
        return 'attendance-pending'
      case AttendanceStatus.ABSENT:
        return 'attendance-absent'
      default:
        return ''
    }
  }

  return (
    <div className="flex justify-center p-4 bg-white rounded-lg border border-gray-200">
      <Calendar
        value={selectedDate}
        onChange={onDateSelect}
        tileClassName={({ date }) => getTileClassName(date)}
        maxDetail="month"
        minDetail="month"
      />
    </div>
  )
}

AttendanceCalendar.displayName = 'AttendanceCalendar'
