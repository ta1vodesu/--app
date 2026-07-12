import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Attendance, AttendanceStatus } from '@/types'

export const AttendancePage: React.FC = () => {
  const { userProfile } = useAuth()
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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
          .order('date', { ascending: false })

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

  const handlePreviousMonth = () => {
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

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="page-title text-lg sm:text-2xl">勤怠一覧</h1>
          <p className="text-sm text-gray-600 mt-1">月単位で勤務時間を確認できます</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="page-title text-lg sm:text-2xl">勤怠一覧</h1>
        <p className="text-sm text-gray-600 mt-1">月単位で勤務時間を確認できます</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{currentMonth.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}</CardTitle>
              <CardDescription>出勤状況</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                ← 前月
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                翌月 →
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-medium">日付</th>
                  <th className="text-left py-2 px-2 font-medium">出勤</th>
                  <th className="text-left py-2 px-2 font-medium">退勤</th>
                  <th className="text-left py-2 px-2 font-medium">勤務時間</th>
                  <th className="text-left py-2 px-2 font-medium">ステータス</th>
                </tr>
              </thead>
              <tbody>
                {attendances.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      勤怠情報がありません
                    </td>
                  </tr>
                ) : (
                  attendances.map((attendance) => (
                    <tr key={attendance.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">{attendance.date}</td>
                      <td className="py-3 px-2">{attendance.check_in_time || '-'}</td>
                      <td className="py-3 px-2">{attendance.check_out_time || '-'}</td>
                      <td className="py-3 px-2">{attendance.working_hours || '-'}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            attendance.status === AttendanceStatus.WORKING
                              ? 'bg-green-100 text-green-700'
                              : attendance.status === AttendanceStatus.HOLIDAY
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {attendance.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

AttendancePage.displayName = 'AttendancePage'
