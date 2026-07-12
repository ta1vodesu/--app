import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { Spinner } from '@/components/common/Spinner'
import { MonthNavigator } from '@/components/common/MonthNavigator'
import { AttendanceCalendar } from '@/components/common/AttendanceCalendar'
import { AttendanceStatus } from '@/types'
import { mockAttendances } from '@/data/mockData'

export const AttendancePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'all'>('all')
  const [dateRange, setDateRange] = useState<'week' | 'month'>('month')
  const [isLoading, setIsLoading] = useState(false)

  const month = selectedDate.getMonth() + 1
  const year = selectedDate.getFullYear()

  const isWeekend = (dateStr: string) => {
    const date = new Date(dateStr)
    const day = date.getDay()
    return day === 0 || day === 6
  }

  const filteredAttendances = useMemo(() => {
    return mockAttendances.filter((attendance) => {
      if (statusFilter !== 'all' && attendance.status !== statusFilter) {
        return false
      }
      return true
    })
  }, [statusFilter])

  const stats = useMemo(() => {
    const working = filteredAttendances.filter(
      (a) => a.status === AttendanceStatus.WORKING
    ).length
    const holiday = filteredAttendances.filter(
      (a) => a.status === AttendanceStatus.HOLIDAY
    ).length

    return { working, holiday, total: filteredAttendances.length }
  }, [filteredAttendances])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="page-title text-lg sm:text-2xl">勤怠一覧</h1>
      </div>

      {/* 月ナビゲーター */}
      <MonthNavigator selectedDate={selectedDate} onMonthChange={setSelectedDate} />

      {/* カレンダー */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">勤怠カレンダー</CardTitle>
          <CardDescription>
            黄色：出勤 / 青色：休日 / 緑色：その他の事項
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceCalendar
            attendances={mockAttendances}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </CardContent>
      </Card>

      {/* フィルター */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* ステータスフィルター */}
            <div>
              <label className="block text-sm font-medium mb-2">ステータス</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'すべて', value: 'all' },
                  { label: '出勤', value: AttendanceStatus.WORKING },
                  { label: '休日', value: AttendanceStatus.HOLIDAY },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={statusFilter === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      setStatusFilter(option.value as AttendanceStatus | 'all')
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 期間フィルター */}
            <div>
              <label className="block text-sm font-medium mb-2">期間</label>
              <div className="flex gap-2">
                {[
                  { label: '週', value: 'week' },
                  { label: '月', value: 'month' },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={dateRange === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateRange(option.value as 'week' | 'month')}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 統計情報 */}
            <div className="space-y-2">
              <p className="text-sm font-medium">統計</p>
              <div className="text-xs space-y-1">
                <p>
                  出勤日: <span className="font-bold text-green-600">{stats.working}</span> 日
                </p>
                <p>
                  休日: <span className="font-bold text-gray-600">{stats.holiday}</span> 日
                </p>
                <p>
                  合計: <span className="font-bold">{stats.total}</span> 件
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 勤怠テーブル */}
      <Card>
        <CardHeader>
          <CardTitle>月次勤怠記録</CardTitle>
          <CardDescription>
            {year}年{String(month).padStart(2, '0')}月の勤怠状況（{filteredAttendances.length}件）
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Spinner label="データを読み込み中..." />
          ) : filteredAttendances.length === 0 ? (
            <EmptyState
              icon="📋"
              title="データがありません"
              description="この条件に該当する勤怠記録はまだありません。"
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
                    <TableHead>ステータス</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendances.map((attendance) => {
                    const isWeekendDay = isWeekend(attendance.date)
                    return (
                      <TableRow
                        key={attendance.id}
                        className={isWeekendDay ? 'bg-gray-50' : ''}
                      >
                        <TableCell className="font-medium">
                          {new Date(attendance.date).toLocaleDateString('ja-JP', {
                            month: 'numeric',
                            day: 'numeric',
                            weekday: 'short',
                          })}
                        </TableCell>
                        <TableCell>
                          {attendance.checkInTime || (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {attendance.checkOutTime || (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {attendance.workingHours || (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={attendance.status} />
                        </TableCell>
                        <TableCell>
                          {attendance.status === AttendanceStatus.WORKING && (
                            <Button variant="link" size="sm" className="h-auto p-0">
                              修正申請
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

AttendancePage.displayName = 'AttendancePage'
