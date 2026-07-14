import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import {
  getTodayJST,
  getMonthRange,
  countElapsedBusinessDays,
  calculateWorkingMinutes,
  formatMinutesToHM,
} from '@/utils/dateHelper'

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

// 秒を切り捨てて HH:MM 形式に
const formatTimeWithoutSeconds = (time: string | null): string | null => {
  if (!time) return null
  const parts = time.split(':')
  return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : time
}

export const DashboardPage: React.FC = () => {
  const { userProfile } = useAuth()
  const [kpi, setKpi] = useState<KPI | null>(null)
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    const fetchDashboardData = async () => {
      if (!userProfile?.id) return

      try {
        setIsLoading(true)

        const today = getTodayJST()
        const [year, month, day] = today.split('-').map(Number)
        const { start: monthStart, end: monthEnd } = getMonthRange(year, month - 1)

        // 本日の全ユーザーの出勤情報（全員共有・出勤時刻の早い順）
        const { data: todayAllData, error: todayError } = await supabase
          .from('attendances')
          .select('*')
          .eq('date', today)
          .order('check_in_time', { ascending: true })

        if (todayError) {
          console.error('[Dashboard] 本日の出勤情報取得エラー:', todayError)
        }

        if (todayAllData && todayAllData.length > 0) {
          const userIds = [...new Set(todayAllData.map((a) => a.user_id))]
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, email, name')
            .in('id', userIds)

          if (profilesError) {
            console.error('[Dashboard] プロフィール取得エラー:', profilesError)
          }

          const attendanceList: TodayAttendance[] = todayAllData.map((att) => {
            const profile = profilesData?.find((p) => p.id === att.user_id)
            return {
              id: att.id,
              email: profile?.email || '不明',
              name: profile?.name || '不明',
              checkInTime: att.check_in_time,
              checkOutTime: att.check_out_time,
            }
          })

          if (!ignore) setTodayAttendance(attendanceList)
        } else if (!ignore) {
          setTodayAttendance([])
        }

        // 自分の当月データ（KPI 計算用）
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('attendances')
          .select('*')
          .eq('user_id', userProfile.id)
          .gte('date', monthStart)
          .lte('date', monthEnd)

        if (monthlyError) {
          console.error('[Dashboard] 月間データ取得エラー:', monthlyError)
        }

        // 自分の承認待ち件数
        const { count: pendingCount, error: pendingError } = await supabase
          .from('corrections')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userProfile.id)
          .eq('status', 'pending')

        if (pendingError) {
          console.error('[Dashboard] 承認待ち件数取得エラー:', pendingError)
        }

        const records = monthlyData || []

        // 出勤率 = 出勤打刻した日数 / 当月の経過営業日数（月〜金）
        const checkedInDays = new Set(
          records.filter((d) => d.check_in_time).map((d) => d.date)
        ).size
        const businessDays = countElapsedBusinessDays(year, month - 1, day)
        const attendanceRate =
          businessDays > 0 ? Math.min(100, Math.round((checkedInDays / businessDays) * 100)) : 0

        // 平均勤務時間・残業時間（1日 8 時間の超過分を合算）
        const dailyMinutes = records
          .filter((d) => d.check_in_time && d.check_out_time)
          .map((d) => calculateWorkingMinutes(d.check_in_time, d.check_out_time))
          .filter((m) => m > 0)

        const avgMinutes =
          dailyMinutes.length > 0
            ? Math.round(dailyMinutes.reduce((a, b) => a + b, 0) / dailyMinutes.length)
            : 0
        const overtimeMinutes = dailyMinutes.reduce((sum, m) => sum + Math.max(0, m - 480), 0)

        if (!ignore) {
          setKpi({
            attendanceRate,
            averageWorkingHours: formatMinutesToHM(avgMinutes),
            pendingApprovals: pendingCount || 0,
            overtimeHours: Math.round((overtimeMinutes / 60) * 10) / 10,
          })
        }
      } catch (err) {
        console.error('[Dashboard] エラー:', err)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    fetchDashboardData()

    return () => {
      ignore = true
    }
  }, [userProfile?.id])

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
              <div className="text-3xl font-bold text-primary">{kpi.attendanceRate}%</div>
              <p className="text-xs text-gray-500 mt-2">今月の営業日ベース</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">平均勤務時間</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{kpi.averageWorkingHours}</div>
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
              <div className="text-3xl font-bold text-purple-600">{kpi.overtimeHours} h</div>
              <p className="text-xs text-gray-500 mt-2">上限: 45h</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>本日の出勤者</CardTitle>
          <CardDescription>
            {todayAttendance.filter((a) => a.checkInTime).length} 名出勤（出勤時刻の早い順）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {todayAttendance.length === 0 ? (
              <p className="text-gray-500 text-sm">本日は出勤記録がありません</p>
            ) : (
              todayAttendance.map((attendance) => (
                <div
                  key={attendance.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{attendance.name}</p>
                    <p className="text-xs text-gray-500">{attendance.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {attendance.checkInTime && (
                      <Badge variant="outline" className="bg-blue-50">
                        出勤: {formatTimeWithoutSeconds(attendance.checkInTime)}
                      </Badge>
                    )}
                    {attendance.checkOutTime && (
                      <Badge variant="outline" className="bg-orange-50">
                        退勤: {formatTimeWithoutSeconds(attendance.checkOutTime)}
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
