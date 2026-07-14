import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

interface CorrectionRequest {
  id: string
  user_id: string
  attendance_id: string
  original_check_in?: string
  corrected_check_in?: string
  original_check_out?: string
  corrected_check_out?: string
  reason: string
  status: string
  created_at: string
}

export const CorrectionRequestPage: React.FC = () => {
  const { userProfile } = useAuth()
  const [myRequests, setMyRequests] = useState<CorrectionRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewRequestForm, setShowNewRequestForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableDates, setAvailableDates] = useState<any[]>([])
  const [newRequest, setNewRequest] = useState({
    attendanceId: '',
    correctedCheckIn: '',
    correctedCheckOut: '',
    reason: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        if (!userProfile?.id) {
          return
        }

        // 修正申請を取得
        const { data: requests } = await supabase
          .from('correction_requests')
          .select('*')
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false })

        setMyRequests(requests || [])

        // 出勤記録を取得
        const { data: attendances } = await supabase
          .from('attendances')
          .select('*')
          .eq('user_id', userProfile.id)
          .order('date', { ascending: false })

        setAvailableDates(attendances || [])
      } catch (err) {
        console.error('[CorrectionRequestPage] エラー:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (userProfile?.id) {
      fetchData()
    }
  }, [userProfile?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userProfile?.id || !newRequest.attendanceId) {
      return
    }

    setIsSubmitting(true)

    try {
      console.log('[CorrectionRequestPage] 修正申請を送信:', newRequest)

      const { error: insertError } = await supabase
        .from('correction_requests')
        .insert({
          user_id: userProfile.id,
          attendance_id: newRequest.attendanceId,
          corrected_check_in: newRequest.correctedCheckIn || null,
          corrected_check_out: newRequest.correctedCheckOut || null,
          reason: newRequest.reason,
          status: 'pending',
        })

      if (insertError) {
        console.error('[CorrectionRequestPage] INSERT エラー:', insertError)
        throw insertError
      }

      console.log('[CorrectionRequestPage] 申請を送信しました')

      // リロード
      const { data } = await supabase
        .from('correction_requests')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })

      setMyRequests(data || [])

      setNewRequest({
        attendanceId: '',
        correctedCheckIn: '',
        correctedCheckOut: '',
        reason: '',
      })
      setShowNewRequestForm(false)
    } catch (err) {
      console.error('[CorrectionRequestPage] 送信エラー:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">修正申請を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">修正申請</h1>
        <p className="text-gray-600 mt-1">勤怠情報の修正を申請できます</p>
      </div>

      <div>
        <Button onClick={() => setShowNewRequestForm(!showNewRequestForm)}>
          {showNewRequestForm ? 'キャンセル' : '新しい申請'}
        </Button>
      </div>

      {showNewRequestForm && (
        <Card>
          <CardHeader>
            <CardTitle>修正申請フォーム</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">対象日付を選択</label>
                <select
                  value={newRequest.attendanceId}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, attendanceId: e.target.value })
                  }
                  className="w-full p-2 border rounded mt-1"
                  required
                >
                  <option value="">-- 選択してください --</option>
                  {availableDates.map((att) => (
                    <option key={att.id} value={att.id}>
                      {att.date} (出勤: {att.check_in_time || '未打刻'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">修正後 出勤時刻</label>
                  <input
                    type="time"
                    value={newRequest.correctedCheckIn}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, correctedCheckIn: e.target.value })
                    }
                    className="w-full p-2 border rounded mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">修正後 退勤時刻</label>
                  <input
                    type="time"
                    value={newRequest.correctedCheckOut}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, correctedCheckOut: e.target.value })
                    }
                    className="w-full p-2 border rounded mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">修正理由</label>
                <textarea
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  className="w-full p-2 border rounded mt-1"
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting || !newRequest.attendanceId}>
                  {isSubmitting ? '送信中...' : '申請を送信'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewRequestForm(false)}
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>my修正申請</CardTitle>
          <CardDescription>{myRequests.length}件</CardDescription>
        </CardHeader>
        <CardContent>
          {myRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">修正申請がありません</p>
          ) : (
            <div className="space-y-4">
              {myRequests.map((request) => (
                <div key={request.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm">対象日付: {request.attendance_id}</p>
                      <p className="text-sm text-gray-600">理由: {request.reason}</p>
                    </div>
                    <Badge
                      className={
                        request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : request.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {request.status === 'pending'
                        ? '待機中'
                        : request.status === 'approved'
                        ? '承認済み'
                        : '却下'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {request.created_at
                      ? new Date(request.created_at).toLocaleString('ja-JP')
                      : '日時不明'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

CorrectionRequestPage.displayName = 'CorrectionRequestPage'
