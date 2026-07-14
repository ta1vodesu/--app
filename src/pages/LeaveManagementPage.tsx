import React, { useState } from 'react'
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
import { EmptyState } from '@/components/common/EmptyState'
import { Spinner } from '@/components/common/Spinner'
import { MonthNavigator } from '@/components/common/MonthNavigator'

interface LeaveRecord {
  id: string
  date: string
  type: 'paid' | 'unpaid' | 'sick' | 'personal'
  reason: string
  status: 'approved' | 'pending' | 'rejected'
}

export const LeaveManagementPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [formData, setFormData] = useState({
    date: '',
    type: 'paid' as const,
    reason: '',
  })

  const [leaves, setLeaves] = useState<LeaveRecord[]>([
    {
      id: '1',
      date: '2026-03-20',
      type: 'paid',
      reason: '年次休暇',
      status: 'approved',
    },
    {
      id: '2',
      date: '2026-03-21',
      type: 'paid',
      reason: '年次休暇',
      status: 'approved',
    },
    {
      id: '3',
      date: '2026-03-25',
      type: 'sick',
      reason: '体調不良',
      status: 'pending',
    },
  ])

  const [submitted, setSubmitted] = useState(false)
  const [isLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newLeave: LeaveRecord = {
      id: `leave-${Date.now()}`,
      date: formData.date,
      type: formData.type,
      reason: formData.reason,
      status: 'pending',
    }

    setLeaves([newLeave, ...leaves])
    setFormData({ date: '', type: 'paid', reason: '' })
    setSubmitted(true)
    setShowForm(false)

    setTimeout(() => setSubmitted(false), 3000)
  }

  const paidLeaveBalance = 15 - leaves.filter((l) => l.type === 'paid').length
  const sickLeaveBalance = 5 - leaves.filter((l) => l.type === 'sick').length

  const typeLabel = {
    paid: '有給休暇',
    unpaid: '無給休暇',
    sick: '病気休暇',
    personal: '特別休暇',
  }

  const typeColor = {
    paid: 'bg-blue-100 text-blue-700',
    unpaid: 'bg-gray-100 text-gray-700',
    sick: 'bg-red-100 text-red-700',
    personal: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="page-title text-lg sm:text-2xl">有給・欠勤管理</h1>
        <p className="text-sm text-gray-600 mt-1">
          有給休暇、病気休暇などを申請・管理します
        </p>
      </div>

      {/* 月ナビゲーター */}
      <MonthNavigator selectedDate={selectedDate} onMonthChange={setSelectedDate} />

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">
休暇申請を送信しました。
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 残数表示 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">有給休暇残数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {paidLeaveBalance}
            </div>
            <p className="text-xs text-gray-600 mt-1">日 / 15日</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">病気休暇残数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {sickLeaveBalance}
            </div>
            <p className="text-xs text-gray-600 mt-1">日 / 5日</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">今月の休暇日数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {leaves.filter((l) =>
                new Date(l.date).getMonth() === new Date().getMonth()
              ).length}
            </div>
            <p className="text-xs text-gray-600 mt-1">日</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">待機中の申請</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {leaves.filter((l) => l.status === 'pending').length}
            </div>
            <p className="text-xs text-gray-600 mt-1">件</p>
          </CardContent>
        </Card>
      </div>

      {/* 新規作成ボタン */}
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          size="lg"
          className="w-full sm:w-auto"
        >
          + 新規休暇申請を作成
        </Button>
      )}

      {/* 休暇申請フォーム */}
      {showForm && (
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>休暇申請</CardTitle>
              <CardDescription>
                休暇を申請してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 日付 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    対象日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* 休暇タイプ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    休暇種別 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="paid">有給休暇</option>
                    <option value="sick">病気休暇</option>
                    <option value="unpaid">無給休暇</option>
                    <option value="personal">特別休暇</option>
                  </select>
                </div>

                {/* 理由 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    理由 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="休暇理由を入力してください（任意）"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    申請する
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 説明 */}
      {showForm && (
        <div className="space-y-3">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-900 font-medium mb-2">
休暇種別について
              </p>
              <ul className="space-y-1 text-xs text-blue-800">
                <li>
                  <strong>有給休暇:</strong> 年15日（残: {paidLeaveBalance}日）
                </li>
                <li>
                  <strong>病気休暇:</strong> 年5日（残: {sickLeaveBalance}日）
                </li>
                <li>
                  <strong>無給休暇:</strong> 承認時のみ計上
                </li>
                <li>
                  <strong>特別休暇:</strong> 企業ポリシーに準拠
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 申請履歴 */}
      <Card>
        <CardHeader>
          <CardTitle>申請履歴</CardTitle>
          <CardDescription>
            過去の休暇申請一覧
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Spinner label="申請履歴を読み込み中..." />
          ) : leaves.length === 0 ? (
            <EmptyState
              icon="🏖️"
              title="申請がありません"
              description="まだ休暇申請がありません。"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>対象日</TableHead>
                    <TableHead>種別</TableHead>
                    <TableHead>理由</TableHead>
                    <TableHead>ステータス</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>
                    {new Date(leave.date).toLocaleDateString('ja-JP')}
                  </TableCell>
                  <TableCell>
                    <div
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        typeColor[leave.type]
                      }`}
                    >
                      {typeLabel[leave.type]}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{leave.reason}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        leave.status === 'approved'
                          ? 'approved'
                          : leave.status === 'pending'
                          ? 'pending'
                          : 'rejected'
                      }
                    >
                      {leave.status === 'approved' && '承認済み'}
                      {leave.status === 'pending' && '待機中'}
                      {leave.status === 'rejected' && '却下'}
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
    </div>
  )
}

LeaveManagementPage.displayName = 'LeaveManagementPage'
