import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MonthNavigator } from '@/components/common/MonthNavigator'
import { RequestStatus } from '@/types'
import { mockApprovals } from '@/data/mockData'

export const CorrectionRequestPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [formData, setFormData] = useState({
    date: '',
    originalCheckIn: '',
    correctedCheckIn: '',
    originalCheckOut: '',
    correctedCheckOut: '',
    reason: '',
  })

  const [submitted, setSubmitted] = useState(false)
  const [myRequests, setMyRequests] = useState(mockApprovals)
  const [showForm, setShowForm] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newRequest = {
      id: `req-${Date.now()}`,
      userId: 'user-001',
      userName: '田中太郎',
      attendanceDate: formData.date,
      originalCheckIn: formData.originalCheckIn || undefined,
      correctedCheckIn: formData.correctedCheckIn || undefined,
      originalCheckOut: formData.originalCheckOut || undefined,
      correctedCheckOut: formData.correctedCheckOut || undefined,
      reason: formData.reason,
      status: RequestStatus.PENDING,
    }

    setMyRequests([newRequest, ...myRequests])
    setFormData({
      date: '',
      originalCheckIn: '',
      correctedCheckIn: '',
      originalCheckOut: '',
      correctedCheckOut: '',
      reason: '',
    })
    setSubmitted(true)
    setShowForm(false)

    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="page-title text-lg sm:text-2xl">修正申請</h1>
        <p className="text-sm text-gray-600 mt-1">
          勤怠記録の修正を申請してください
        </p>
      </div>

      {/* 月ナビゲーター */}
      <MonthNavigator selectedDate={selectedDate} onMonthChange={setSelectedDate} />

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">
            ✅ 修正申請を送信しました。管理者の確認をお待ちください。
          </p>
        </div>
      )}

      {/* 新規作成ボタン */}
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          size="lg"
          className="w-full sm:w-auto"
        >
          + 新規修正申請を作成
        </Button>
      )}

      {/* 修正申請フォーム */}
      {showForm && (
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>修正申請フォーム</CardTitle>
              <CardDescription>
                勤怠記録を修正したい場合はこちらから申請してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 対象日 */}
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

                {/* 出勤時刻 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      元の出勤時刻
                    </label>
                    <input
                      type="time"
                      name="originalCheckIn"
                      value={formData.originalCheckIn}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      修正後の出勤時刻
                    </label>
                    <input
                      type="time"
                      name="correctedCheckIn"
                      value={formData.correctedCheckIn}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* 退勤時刻 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      元の退勤時刻
                    </label>
                    <input
                      type="time"
                      name="originalCheckOut"
                      value={formData.originalCheckOut}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      修正後の退勤時刻
                    </label>
                    <input
                      type="time"
                      name="correctedCheckOut"
                      value={formData.correctedCheckOut}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* 理由 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    修正理由 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="修正理由を入力してください"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <Button type="submit" className="w-full">
                  申請する
                </Button>
                <div className="flex gap-2 pt-2">
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

      {/* 申請状況 */}
      <div>
          <Card>
            <CardHeader>
              <CardTitle>申請状況</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {myRequests.slice(0, 3).map((req) => (
                <div key={req.id} className="border-b pb-3 last:border-b-0">
                  <p className="text-xs text-gray-600">
                    {new Date(req.attendanceDate).toLocaleDateString('ja-JP')}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        req.status === RequestStatus.PENDING
                          ? 'pending'
                          : req.status === RequestStatus.APPROVED
                          ? 'approved'
                          : 'rejected'
                      }
                    >
                      {req.status === RequestStatus.PENDING && '待機中'}
                      {req.status === RequestStatus.APPROVED && '承認済み'}
                      {req.status === RequestStatus.REJECTED && '却下'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

CorrectionRequestPage.displayName = 'CorrectionRequestPage'
