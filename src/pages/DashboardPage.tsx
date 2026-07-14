import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

interface KPI {
  attendanceRate: number
  averageWorkingHours: string
  pendingApprovals: number
  overtimeHours: number
}

interface TodayAttendance {
  id: string
  email: string
  name: string
  checkInTime: string | null
  checkOutTime: string | null
}

export const DashboardPage: React.FC = () => {
  const { userProfile } = useAuth()
  const [kpi, setKpi] = useState<KPI | null>(null)
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 時刻から分を計算
  const calculateWorkingHours = (checkIn: string | null, checkOut: string | null): number => {
    if (!checkIn || !checkOut) return 0
    try {
      const [inHour, inMin] = checkIn.split(':').map(Number)
      const [outHour, outMin] = checkOut.split(':').map(Number)
      const inMinutes = inHour * 60 + inMin
      const outMinutes = outHour * 60 + outMin
      const diff = outMinutes - inMinutes
      return diff > 0 ? diff / 60 : 0
    } catch {
      return 0
    }
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)

        if (!userProfile?.id) {
          return
        }

        const now = new Date()
        const today = now.toLocaleDateString('en-CA')
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() + 1
        const monthStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
        const monthEnd = `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`

        // 本日のすべてのユーザーの出勤情報（全員共有）
        const { data: todayAllData } = await supabase
          .from('attendances')
          .select('*')
          .eq('date', today)
          .order('check_in_time', { ascending: true,  })

        if (todayAllData && todayAllData.length > 0) {
          const userIds = [...new Set(todayAllData.map(a => a.user_id))]
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, email, name')
            .in('id', userIds)

          const attendanceList: TodayAttendance[] = todayAllData
            .map(att => {
              const profile = profilesData?.find(p => p.id === att.user_id)
              return {
                id: att.id,
                email: profile?.email || '不明',
                name: profile?.name || '不明',
                checkInTime: att.check_in_time,
                checkOutTime: att.check_out_time,
              }
            })
            // 出勤時刻でソート（早い順）
            .sort((a, b) => {
              if (!a.checkInTime && !b.checkInTime) return 0
              if (!a.checkInTime) return 1
              if (!b.checkInTime) return -1
              return a.checkInTime.localeCompare(b.checkInTime)
            })

          setTodayAttendance(attendanceList)
        }

        // このユーザーの月間データだけを取得（KPI計算用）
        const { data: monthlyData } = await supabase
          .from('attendances')
          .select('*')
          .eq('user_id', userProfile.id)
          .gte('date', monthStart)
          .lte('date', monthEnd)

        if (monthlyData && monthlyData.length > 0) {
          // 出勤日数 / 営業日数
          const uniqueDates = [...new Set(monthlyData.map(d => d.date))]
          const checkedInDays = uniqueDates.filter(date => {
            return monthlyData.some(d => d.date === date && d.check_in_time)
          }).length
          const attendanceRate = uniqueDates.length > 0 
            ? Math.round((checkedInDays / uniqueDates.length) * 100)
            : 0

          // 平均勤務時間
          const workingHours = monthlyData
            .filter(d => d.check_in_time && d.check_out_time)
            .map(d => calculateWorkingHours(d.check_in_time, d.check_out_time))
          
          const avgHours = workingHours.length > 0 
            ? workingHours.reduce((a, b) => a + b, 0) / workingHours.length 
            : 0
          const hours = Math.floor(avgHours)
          const minutes = Math.round((avgHours - hours) * 60)

          // このユーザーの承認待ち件数
          const { count: pendingCount } = await supabase
            .from('corrections')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userProfile.id)
            .eq('status', 'pending')

          setKpi({
            attendanceRate,
            averageWorkingHours: `${hours}h${String(minutes).padStart(2, '0')}m`,
            pendingApprovals: pendingCount || 0,
            overtimeHours: 0,
          })
        } else {
          // データがない場合は0を表示
          setKpi({
            attendanceRate: 0,
            averageWorkingHours: '0h00m',
            pendingApprovals: 0,
            overtimeHours: 0,
          })
        }
      } catch (err) {
        console.error('[Dashboard] エラー:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [userProfile?.id, userProfile?.email, userProfile?.name])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">ダッシュボード情報を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <p className="text-gray-600 mt-1">勤怠情報サマリー</p>
      </div>

      {kpi && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">出勤率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{kpi.attendanceRate}%</div>
              <p className="text-xs text-gray-500 mt-2">今月</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">平均勤務時間</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{kpi.averageWorkingHours}</div>
              <p className="text-xs text-gray-500 mt-2">目標: 8h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">承認待ち</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{kpi.pendingApprovals} 件</div>
              <p className="text-xs text-gray-500 mt-2">要対応</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">今月残業</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{kpi.overtimeHours} h</div>
              <p className="text-xs text-gray-500 mt-2">上限: 45h</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>本日の出勤者</CardTitle>
          <CardDescription>
            {todayAttendance.filter(a => a.checkInTime).length} 名出勤（出勤時刻の早い順）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {todayAttendance.length === 0 ? (
              <p className="text-gray-500 text-sm">本日は出勤記録がありません</p>
            ) : (
              todayAttendance.map(attendance => (
                <div key={attendance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{attendance.name}</p>
                    <p className="text-xs text-gray-500">{attendance.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {attendance.checkInTime && (
                      <Badge variant="outline" className="bg-green-50">
                        出勤: {attendance.checkInTime}
                      </Badge>
                    )}
                    {attendance.checkOutTime && (
                      <Badge variant="outline" className="bg-blue-50">
                        退勤: {attendance.checkOutTime}
                      </Badge>
                    )}
                    {!attendance.checkInTime && (
                      <Badge variant="outline" className="bg-gray-50">
                        未出勤
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

DashboardPage.displayName = 'DashboardPage'
