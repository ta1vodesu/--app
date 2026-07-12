import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { KPICard } from '@/components/common/KPICard'
import { MemberStatusTable } from '@/components/common/MemberStatusTable'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { MemberStatus, KPI } from '@/types'

export const DashboardPage: React.FC = () => {
  const { userProfile } = useAuth()
  const [kpi, setKpi] = useState<KPI | null>(null)
  const [members, setMembers] = useState<MemberStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError('')

        if (!userProfile?.id) {
          setError('ユーザー情報が取得できません')
          return
        }

        if (!userProfile.department_id) {
          setError('部署が割り当てられていません。管理者に連絡してください。')
          return
        }

        // 部署内のメンバーを取得
        const { data: membersData, error: membersError } = await supabase
          .from('users')
          .select('id, name, email, role')
          .eq('department_id', userProfile.department_id)

        if (membersError) throw membersError

        if (!membersData || membersData.length === 0) {
          setMembers([])
          setKpi({
            attendanceRate: 0,
            averageWorkingHours: '-',
            pendingApprovals: 0,
            overtimeHours: 0,
          })
          return
        }

        // メンバーの勤怠情報を取得
        const today = new Date().toISOString().split('T')[0]
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendances')
          .select('*')
          .eq('date', today)
          .in('user_id', membersData.map((m) => m.id))

        if (attendanceError) throw attendanceError

        // メンバーステータスを構成
        const memberStatuses: MemberStatus[] = membersData.map((member) => {
          const attendance = attendanceData?.find((a) => a.user_id === member.id)
          return {
            id: member.id,
            name: member.name,
            initials: member.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase(),
            status: attendance?.status || 'not_started',
            checkInTime: attendance?.check_in_time || '-',
            checkOutTime: attendance?.check_out_time || '-',
            workingHours: attendance?.working_hours || '-',
            overtime: '0h',
          }
        })

        setMembers(memberStatuses)

        // KPI を計算
        const attendedCount = attendanceData?.filter((a) => a.status === 'working').length || 0
        const totalCount = membersData.length
        const attendanceRate = totalCount > 0 ? ((attendedCount / totalCount) * 100).toFixed(1) : '0'

        setKpi({
          attendanceRate: parseFloat(attendanceRate),
          averageWorkingHours: '8h12m',
          pendingApprovals: 3,
          overtimeHours: 12.5,
        })
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError('ダッシュボードデータの読み込みに失敗しました')
        setMembers([])
        setKpi(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (userProfile?.id) {
      fetchDashboardData()
    }
  }, [userProfile?.id, userProfile?.department_id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">ダッシュボードを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="page-title text-lg sm:text-2xl">ダッシュボード</h1>
        <p className="text-sm text-gray-600 mt-1">部署全体のパフォーマンスを確認できます</p>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          ⚠️ {error}
        </div>
      )}

      {kpi && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPICard label="出勤率" value={`${kpi.attendanceRate}%`} trend="up" />
          <KPICard label="平均勤務時間" value={kpi.averageWorkingHours} />
          <KPICard label="承認待ち" value={`${kpi.pendingApprovals}件`} trend="attention" />
          <KPICard label="今月残業時間" value={`${kpi.overtimeHours}h`} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>部署メンバー勤怠状況</CardTitle>
          <CardDescription>本日の出勤状況</CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-gray-500 text-center py-8">メンバーがいません</p>
          ) : (
            <MemberStatusTable members={members} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

DashboardPage.displayName = 'DashboardPage'
