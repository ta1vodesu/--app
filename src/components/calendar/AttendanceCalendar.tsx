import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

interface CalendarDay {
  date: Date
  dayOfMonth: number
  isCurrentMonth: boolean
  status: 'working' | 'leave' | 'holiday' | null
  checkInTime: string | null
}

export const AttendanceCalendarComponent: React.FC = () => {
  const { userProfile } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [attendanceMap, setAttendanceMap] = useState<Record<string, any>>({})
  const [leaveMap, setLeaveMap] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)

  // 勤怠データを取得
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!userProfile?.id) return

      try {
        setIsLoading(true)
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1

        const startDate = `${year}-${String(month).padStart(2, '0')}-01`
        const endDate = `${year}-${String(month).padStart(2, '0')}-31`

        // 勤怠情報を取得
        const { data: attendances } = await supabase
          .from('attendances')
          .select('*')
          .eq('user_id', userProfile.id)
          .gte('date', startDate)
          .lte('date', endDate)

        // 有給情報を取得
        const { data: leaves } = await supabase
          .from('leave_requests')
          .select('*')
          .eq('user_id', userProfile.id)
          .gte('leave_date', startDate)
          .lte('leave_date', endDate)
          .eq('status', 'approved')

        const attMap: Record<string, any> = {}
        const leaveM: Record<string, any> = {}

        attendances?.forEach((att) => {
          attMap[att.date] = att
        })

        leaves?.forEach((leave) => {
          leaveM[leave.leave_date] = leave
        })

        setAttendanceMap(attMap)
        setLeaveMap(leaveM)
      } catch (err) {
        console.error('Failed to fetch attendance data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAttendanceData()
  }, [userProfile?.id, currentDate])

  // カレンダーを生成
  useEffect(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // 月の最初の日と最後の日
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // 前月の日付で埋める
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    // 次月の日付で埋める
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))

    const days: CalendarDay[] = []
    const current = new Date(startDate)

    while (current <= endDate) {
      const dateStr = current.toLocaleDateString('en-CA')
      const isCurrentMonth = current.getMonth() === month

      let status: 'working' | 'leave' | 'holiday' | null = null

      if (attendanceMap[dateStr]) {
        status = 'working'
      } else if (leaveMap[dateStr]) {
        status = 'leave'
      } else if (current.getDay() === 0 || current.getDay() === 6) {
        // 日曜日と土曜日
        status = 'holiday'
      }

      days.push({
        date: new Date(current),
        dayOfMonth: current.getDate(),
        isCurrentMonth,
        status,
        checkInTime: attendanceMap[dateStr]?.check_in_time || null,
      })

      current.setDate(current.getDate() + 1)
    }

    setCalendarDays(days)
  }, [currentDate, attendanceMap, leaveMap])

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'working':
        return 'bg-blue-100 border-blue-300'
      case 'leave':
        return 'bg-purple-100 border-purple-300'
      case 'holiday':
        return 'bg-orange-100 border-orange-300'
      default:
        return 'bg-white'
    }
  }

  const getStatusTextColor = (status: string | null) => {
    switch (status) {
      case 'working':
        return 'text-blue-700'
      case 'leave':
        return 'text-purple-700'
      case 'holiday':
        return 'text-orange-700'
      default:
        return 'text-gray-900'
    }
  }

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'working':
        return '出勤'
      case 'leave':
        return '有給'
      case 'holiday':
        return '休み'
      default:
        return ''
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-lg sm:text-2xl">勤怠カレンダー</h1>
        <p className="text-sm text-gray-600 mt-1">月間の勤怠状況を確認できます</p>
      </div>

      {/* 凡例 */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
          <span className="text-gray-700">出勤</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
          <span className="text-gray-700">有給</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
          <span className="text-gray-700">休み</span>
        </div>
      </div>

      {/* カレンダー */}
      <div className="bg-white rounded-lg shadow">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-md transition"
              title="前月"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-md transition"
              title="翌月"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* カレンダーグリッド */}
        <div className="p-6">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div key={day} className="text-center font-semibold text-gray-600 text-sm h-8">
                {day}
              </div>
            ))}
          </div>

          {/* カレンダーセル */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`
                  aspect-square rounded-lg border-2 p-2 text-sm flex flex-col items-center justify-between
                  ${getStatusColor(day.status)}
                  ${!day.isCurrentMonth ? 'opacity-30' : ''}
                  transition hover:shadow-md
                `}
              >
                <span className={`font-semibold ${getStatusTextColor(day.status)}`}>
                  {day.dayOfMonth}
                </span>
                {day.status && (
                  <div className="text-xs font-medium">
                    {day.status === 'working' && day.checkInTime ? (
                      <span className={getStatusTextColor(day.status)}>{day.checkInTime}</span>
                    ) : (
                      <span className={getStatusTextColor(day.status)}>{getStatusLabel(day.status)}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

AttendanceCalendarComponent.displayName = 'AttendanceCalendar'
