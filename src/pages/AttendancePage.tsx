import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Attendance } from '@/types'

export const AttendancePage: React.FC = () => {
  const { userProfile } = useAuth()
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState<Attendance | null>(null)

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        setIsLoading(true)

        if (!userProfile?.id) {
          setError('ユーザー情報が取得できません')
          return
        }

        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
          .toISOString()
          .split('T')[0]
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
          .toISOString()
          .split('T')[0]

        const { data, error: fetchError } = await supabase
          .from('attendances')
          .select('*')
          .eq('user_id', userProfile.id)
          .gte('date', startOfMonth)
          .lte('date', endOfMonth)
          .order('date', { ascending: true })

        if (fetchError) throw fetchError

        setAttendances(data || [])
      } catch (err) {
        console.error('Failed to fetch attendances:', err)
        setError('勤怠情報の読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    if (userProfile?.id) {
      fetchAttendances()
    }
  }, [userProfile?.id, currentMonth])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getAttendanceForDate = (day: number) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      .toISOString()
      .split('T')[0]
    return attendances.find((a) => a.date === dateStr)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working':
        return 'bg-green-100 text-green-800'
      case 'holiday':
        return 'bg-gray-100 text-gray-800'
      case 'absent':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'worked':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-white text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'working':
        return '出勤中'
      case 'holiday':
        return '休日'
      case 'absent':
        return '欠勤'
      case 'pending':
        return '保留中'
      case 'worked':
        return '退勤済'
      default:
        return '-'
    }
  }

  const monthName = currentMonth.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })
  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const weeks: (number | null)[][] = []

  let currentWeek: (number | null)[] = Array(firstDay).fill(null)
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek.concat(Array(7 - currentWeek.length).fill(null)))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">勤怠情報を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title text-lg sm:text-2xl">勤怠一覧</h1>
          <p className="text-sm text-gray-600 mt-1">カレンダー形式で勤怠を管理</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none text-xs sm:text-sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          >
            ← 前月
          </Button>
          <Button
            variant="outline"
            className="flex-1 sm:flex-none text-xs sm:text-sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            今月
          </Button>
          <Button
            variant="outline"
            className="flex-1 sm:flex-none text-xs sm:text-sm"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          >
            翌月 →
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 overflow-x-auto">
          <Card>
            <CardHeader>
              <CardTitle>{monthName}</CardTitle>
              <CardDescription>日付をクリックして詳細を確認</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
                {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                  <div key={day} className="text-center font-bold text-xs sm:text-sm py-1 sm:py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {weeks.map((week, weekIndex) =>
                  week.map((day, dayIndex) => {
                    const attendance = day ? getAttendanceForDate(day) : null
                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`aspect-square p-1 sm:p-2 border rounded cursor-pointer transition text-xs sm:text-sm ${
                          day
                            ? attendance
                              ? `${getStatusColor(attendance.status)} border-current`
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                        onClick={() => attendance && setSelectedDate(attendance)}
                      >
                        {day && (
                          <div className="font-semibold mb-0.5">{day}</div>
                        )}
                        {attendance && (
                          <div className="truncate line-clamp-1">
                            {getStatusLabel(attendance.status)}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t space-y-2">
                <p className="text-xs sm:text-sm font-semibold">凡例</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-green-100 border border-green-800 rounded flex-shrink-0"></div>
                    <span>出勤中</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-blue-100 border border-blue-800 rounded flex-shrink-0"></div>
                    <span>退勤済</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-yellow-100 border border-yellow-800 rounded flex-shrink-0"></div>
                    <span>保留中</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-gray-100 border border-gray-800 rounded flex-shrink-0"></div>
                    <span>休日</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-red-100 border border-red-800 rounded flex-shrink-0"></div>
                    <span>欠勤</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedDate ? (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-base">勤怠詳細</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">日付</label>
                  <p className="text-lg">
                    {new Date(selectedDate.date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long',
                    })}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">ステータス</label>
                  <Badge className="mt-1">
                    {getStatusLabel(selectedDate.status)}
                  </Badge>
                </div>

                {selectedDate.check_in_time && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">出勤時刻</label>
                    <p className="text-lg">{selectedDate.check_in_time}</p>
                  </div>
                )}

                {selectedDate.check_out_time && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">退勤時刻</label>
                    <p className="text-lg">{selectedDate.check_out_time}</p>
                  </div>
                )}

                {selectedDate.working_hours && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">勤務時間</label>
                    <p className="text-lg">{selectedDate.working_hours}</p>
                  </div>
                )}

                {selectedDate.break_time && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">休憩時間</label>
                    <p className="text-lg">{selectedDate.break_time}</p>
                  </div>
                )}

                {selectedDate.overtime && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">残業時間</label>
                    <p className="text-lg">{selectedDate.overtime}</p>
                  </div>
                )}

                {selectedDate.notes && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">備考</label>
                    <p className="text-sm">{selectedDate.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">
                  カレンダーから日付を選択して詳細を表示
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

AttendancePage.displayName = 'AttendancePage'
