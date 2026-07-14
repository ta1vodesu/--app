import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Attendance } from '@/types'

type FilterType = 'all' | 'working' | 'absent' | 'holiday'

export const AttendancePage: React.FC = () => {
  const { userProfile } = useAuth()
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState<Attendance | null>(null)
  const [filterType, setFilterType] = useState<FilterType>('all')

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

  // フィルタ適用
  const getFilteredAttendances = () => {
    if (filterType === 'all') {
      return attendances
    }
    return attendances.filter(a => {
      const normalizedStatus = a.status || 'working'
      return normalizedStatus === filterType
    })
  }

  const filteredAttendances = getFilteredAttendances()

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
    const att = attendances.find((a) => a.date === dateStr)
    // フィルタに合わせて表示/非表示を切り替え
    if (filterType === 'all') return att
    if (att) {
      const normalizedStatus = att.status || 'working'
      if (normalizedStatus === filterType) return att
    }
    return null
  }

  const getStatusColor = (status: string | null) => {
    const normalizedStatus = status || 'working'
    switch (normalizedStatus) {
      case 'working':
        return 'bg-green-100 text-green-800'
      case 'holiday':
        return 'bg-gray-100 text-gray-800'
      case 'absent':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const getStatusLabel = (status: string | null) => {
    const normalizedStatus = status || 'working'
    switch (normalizedStatus) {
      case 'working':
        return '出勤'
      case 'holiday':
        return '休日'
      case 'absent':
        return '欠勤'
      default:
        return '出勤'
    }
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
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

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">勤怠一覧</h1>
        <p className="text-gray-600 mt-1">月単位で出勤日時・勤務時間を確認できます</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* フィルタボタン */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">フィルタ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              すべて ({attendances.length}件)
            </Button>
            <Button
              variant={filterType === 'working' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('working')}
              className={filterType === 'working' ? 'bg-green-600' : ''}
            >
              出勤 ({attendances.filter(a => (a.status || 'working') === 'working').length}件)
            </Button>
            <Button
              variant={filterType === 'absent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('absent')}
              className={filterType === 'absent' ? 'bg-red-600' : ''}
            >
              欠勤 ({attendances.filter(a => a.status === 'absent').length}件)
            </Button>
            <Button
              variant={filterType === 'holiday' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('holiday')}
              className={filterType === 'holiday' ? 'bg-gray-600' : ''}
            >
              休日 ({attendances.filter(a => a.status === 'holiday').length}件)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* カレンダー */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
              </CardTitle>
              <CardDescription>
                {filterType === 'all'
                  ? 'すべての勤怠記録'
                  : `${filterType === 'working' ? '出勤' : filterType === 'absent' ? '欠勤' : '休日'}の日のみ表示`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                前月
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                翌月
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-6 overflow-x-auto">
          <div className="grid grid-cols-7 gap-0.5 sm:gap-2 min-w-max sm:min-w-0">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div key={day} className="text-center font-medium text-xs sm:text-sm text-gray-600 py-1 sm:py-2 w-12 sm:w-auto">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square w-12 sm:w-auto"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const att = getAttendanceForDate(day)
              const isFiltered = att !== null || filterType === 'all'

              return (
                <div
                  key={day}
                  className={`aspect-square p-1 sm:p-2 rounded border-2 text-center cursor-pointer transition w-12 sm:w-auto ${
                    att
                      ? `${getStatusColor(att.status)} border-current`
                      : 'bg-gray-50 text-gray-400 border-gray-200'
                  } ${
                    isFiltered
                      ? 'opacity-100'
                      : 'opacity-30'
                  }`}
                  onClick={() => att && setSelectedDate(att)}
                >
                  <div className="text-xs sm:text-sm font-medium">{day}</div>
                  {att && (
                    <div className="text-xs sm:text-xs mt-0.5 sm:mt-1 line-clamp-1">
                      {att.check_in_time ? att.check_in_time.substring(0, 5) : '—'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 勤怠一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>勤怠詳細</CardTitle>
          <CardDescription>
            {filteredAttendances.length}件の記録
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAttendances.length === 0 ? (
            <p className="text-gray-500 text-center py-8">該当する勤怠記録がありません</p>
          ) : (
            <div className="space-y-2">
              {filteredAttendances.map((att) => (
                <div
                  key={att.id}
                  className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setSelectedDate(att)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{att.date}</p>
                      <p className="text-sm text-gray-600">
                        出勤: {att.check_in_time || '—'} / 退勤: {att.check_out_time || '—'}
                      </p>
                    </div>
                    <Badge className={getStatusColor(att.status)}>
                      {getStatusLabel(att.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 詳細表示 */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedDate.date} の詳細</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">ステータス</p>
                <Badge className={getStatusColor(selectedDate.status)}>
                  {getStatusLabel(selectedDate.status)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">出勤時刻</p>
                <p className="font-medium">{selectedDate.check_in_time || '記録なし'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">退勤時刻</p>
                <p className="font-medium">{selectedDate.check_out_time || '記録なし'}</p>
              </div>
              {selectedDate.working_hours && (
                <div>
                  <p className="text-sm text-gray-600">勤務時間</p>
                  <p className="font-medium">{selectedDate.working_hours}時間</p>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => setSelectedDate(null)}
            >
              閉じる
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

AttendancePage.displayName = 'AttendancePage'
