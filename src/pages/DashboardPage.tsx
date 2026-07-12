import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { MemberStatusTable } from '@/components/dashboard/MemberStatusTable'
import { MonthNavigator } from '@/components/common/MonthNavigator'
import { Spinner } from '@/components/common/Spinner'
import { ErrorState } from '@/components/common/ErrorState'
import { mockKPI, mockMembers } from '@/data/mockData'

export const DashboardPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        // APIコール時にここでデータを取得します
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [selectedDate])

  if (isLoading) {
    return <Spinner label="ダッシュボードを読み込み中..." fullScreen />
  }

  if (error) {
    return (
      <ErrorState
        title="ダッシュボード読み込みエラー"
        message={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="page-title text-lg sm:text-2xl">ダッシュボード</h1>
      </div>

      {/* 月ナビゲーター */}
      <MonthNavigator selectedDate={selectedDate} onMonthChange={setSelectedDate} />

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <KpiCard
          label="出勤率"
          value={mockKPI.attendanceRate}
          suffix="%"
          trend={1.3}
          color="green"
        />
        <KpiCard
          label="平均勤務時間"
          value={mockKPI.averageWorkingHours}
          trend={0}
          color="blue"
        />
        <KpiCard
          label="承認待ち"
          value={mockKPI.pendingApprovals}
          suffix="件"
          color="orange"
        />
        <KpiCard
          label="今月残業"
          value={mockKPI.overtimeHours}
          suffix="h"
          trend={2.5}
          color="red"
        />
      </div>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">部署メンバー勤怠</CardTitle>
          <CardDescription>
            本日の勤務状況
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="w-full min-w-min">
            <MemberStatusTable members={mockMembers} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

DashboardPage.displayName = 'DashboardPage'
