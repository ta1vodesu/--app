import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MonthNavigator } from '@/components/common/MonthNavigator'
import { Spinner } from '@/components/common/Spinner'
import { EmptyState } from '@/components/common/EmptyState'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { calculateMonthlyStats, convertAttendanceToDailyReport, DailyReportData, MonthlyStats } from '@/utils/dashboardUtils'

export const MonthlyReportPage: React.FC = () => {
  const { userProfile } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [dailyReports, setDailyReports] = useState<DailyReportData[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true)
        setError('')

        if (!userProfile?.id) {
          setError('ユーザー情報が取得できません')
          setIsLoading(false)
          return
        }

        const year = selectedDate.getFullYear()
        const month = selectedDate.getMonth()
        const monthStart = new Date(year, month, 1).toISOString().split('T')[0]
        const monthEnd = new Date(year, month + 1, 0).toISOString().split('T')[0]

        // 月別の勤怠データを取得
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendances')
          .select('*')
          .eq('user_id', userProfile.id)
          .gte('date', monthStart)
          .lte('date', monthEnd)
          .order('date', { ascending: true })

        if (attendanceError) {
          console.error('Attendance query error:', attendanceError)
          throw new Error(`勤怠データ取得エラー: ${attendanceError.message}`)
        }

        if (!attendanceData || attendanceData.length === 0) {
          setDailyReports([])
          setMonthlyStats({
            totalWorkingDays: 0,
            totalWorkingHours: '-',
            totalOvertime: '-',
            averageWorkingHours: '-',
            absentDays: 0,
            holidayDays: 0,
          })
          setIsLoading(false)
          return
        }

        // 日別レポートに変換
        const reports = convertAttendanceToDailyReport(attendanceData)
        setDailyReports(reports)

        // 統計情報を計算
        const stats = calculateMonthlyStats(attendanceData)
        setMonthlyStats(stats)
      } catch (err) {
        console.error('Failed to fetch report data:', err)
        const errorMsg = err instanceof Error ? err.message : 'レポートデータの読み込みに失敗しました'
        setError(errorMsg)
        setDailyReports([])
        setMonthlyStats(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (userProfile?.id) {
      fetchReportData()
    }
  }, [userProfile?.id, selectedDate])

  const handleExport = () => {
    if (dailyReports.length === 0) {
      alert('エクスポート対象のデータがありません')
      return
    }

    // CSV生成
    const headers = ['日付', '出勤', '退勤', '勤務時間', '休憩時間', '残業時間', 'ステータス']
    const rows = dailyReports.map((report) => [
      `${report.date} (${report.dayOfWeek})`,
      report.checkIn,
      report.checkOut,
      report.workingHours,
      report.breakTime,
      report.overtime,
      getStatusLabel(report.status),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    const filename = `monthly_report_${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}.csv`

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working':
        return 'bg-green-50'
      case 'holiday':
        return 'bg-gray-50'
      case 'absent':
        return 'bg-red-50'
      case 'pending':
        return 'bg-yellow-50'
      default:
        return 'bg-white'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'working':
        return '出勤'
      case 'holiday':
        return '休日'
      case 'absent':
        return '欠勤'
      case 'pending':
        return '保留中'
      default:
        return '-'
    }
  }

  const getStatusBadgeVariant = (status: string): 'default' | 'working' | 'holiday' | 'pending' | 'approved' | 'rejected' => {
    switch (status) {
      case 'working':
        return 'working'
      case 'holiday':
        return 'holiday'
      case 'absent':
        return 'rejected'
      case 'pending':
        return 'pending'
      default:
        return 'default'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="page-title text-lg sm:text-2xl">月次勤怠レポート</h1>
        <p className="text-sm text-gray-600 mt-1">
          月間の勤怠実績を確認・分析します
        </p>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
          <p className="font-medium">エラー</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* 月ナビゲーター */}
      <MonthNavigator selectedDate={selectedDate} onMonthChange={setSelectedDate} />

      {/* フィルター */}
      <div className="space-y-3">
        {!showFilters && (
          <Button
            onClick={() => setShowFilters(true)}
            variant="outline"
            className="w-full sm:w-auto"
          >
詳細フィルター
          </Button>
        )}

        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">日付範囲フィルター</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    開始日付
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    終了日付
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="flex-1">適用</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFilters(false)}
                  className="flex-1"
                >
                  閉じる
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 統計情報 */}
      {monthlyStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">出勤日数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {monthlyStats.totalWorkingDays}
              </div>
              <p className="text-xs text-gray-600 mt-1">日</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">合計勤務時間</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {monthlyStats.totalWorkingHours}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">合計残業時間</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {monthlyStats.totalOvertime}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">平均勤務時間</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {monthlyStats.averageWorkingHours}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">欠勤日数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {monthlyStats.absentDays}
              </div>
              <p className="text-xs text-gray-600 mt-1">日</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">休日数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {monthlyStats.holidayDays}
              </div>
              <p className="text-xs text-gray-600 mt-1">日</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 日別詳細 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>日別詳細</CardTitle>
              <CardDescription>
                {new Date(selectedDate.getFullYear(), selectedDate.getMonth()).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                })}
              </CardDescription>
            </div>
            <Button onClick={handleExport} className="w-full sm:w-auto" disabled={isLoading || dailyReports.length === 0}>
CSVエクスポート
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Spinner label="レポートを読み込み中..." />
          ) : dailyReports.length === 0 ? (
            <EmptyState
              icon=""
              title="データがありません"
              description="選択した期間の勤怠データがありません。"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日付</TableHead>
                    <TableHead>出勤</TableHead>
                    <TableHead>退勤</TableHead>
                    <TableHead>勤務時間</TableHead>
                    <TableHead>休憩時間</TableHead>
                    <TableHead>残業</TableHead>
                    <TableHead>ステータス</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyReports.map((report) => (
                    <TableRow key={report.date} className={getStatusColor(report.status)}>
                      <TableCell className="font-medium">
                        {new Date(report.date).toLocaleDateString('ja-JP', {
                          month: '2-digit',
                          day: '2-digit',
                        })}
                        <span className="text-xs text-gray-600 ml-1">({report.dayOfWeek})</span>
                      </TableCell>
                      <TableCell>{report.checkIn}</TableCell>
                      <TableCell>{report.checkOut}</TableCell>
                      <TableCell className="font-medium">{report.workingHours}</TableCell>
                      <TableCell>{report.breakTime}</TableCell>
                      <TableCell className="text-orange-600 font-medium">{report.overtime}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(report.status)}>
                          {getStatusLabel(report.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 月間サマリー */}
      {monthlyStats && (
        <Card>
          <CardHeader>
            <CardTitle>月間サマリー</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-700">総勤務日数</span>
                  <span className="font-bold">{monthlyStats.totalWorkingDays}日</span>
                </div>
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-700">合計勤務時間</span>
                  <span className="font-bold">{monthlyStats.totalWorkingHours}</span>
                </div>
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-700">平均勤務時間</span>
                  <span className="font-bold">{monthlyStats.averageWorkingHours}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-700">合計残業時間</span>
                  <span className="font-bold text-orange-600">{monthlyStats.totalOvertime}</span>
                </div>
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-700">欠勤日数</span>
                  <span className="font-bold text-red-600">{monthlyStats.absentDays}日</span>
                </div>
                <div className="flex justify-between pb-3 border-b">
                  <span className="text-gray-700">休日数</span>
                  <span className="font-bold">{monthlyStats.holidayDays}日</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

MonthlyReportPage.displayName = 'MonthlyReportPage'
