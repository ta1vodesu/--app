import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Attendance } from '@/types'

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
  const [availableDates, setAvailableDates] = useState<Attendance[]>([])
  const [formError, setFormError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingRequest, setEditingRequest] = useState<Partial<CorrectionRequest>>({})
  const [newRequest, setNewRequest] = useState({
    attendanceId: '',
    correctedCheckIn: '',
    correctedCheckOut: '',
    reason: '',
  })

  const pendingRequests = myRequests.filter((req) => req.status === 'pending')
  const completedRequests = myRequests.filter((req) => req.status !== 'pending')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        if (!userProfile?.id) {
          return
        }

        // 修正申請を取得（全ステータス）
        const { data: requests, error: requestsError } = await supabase
          .from('corrections')
          .select('*')
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false })

        if (requestsError) {
          console.error('[CorrectionRequestPage] 修正申請取得エラー:', requestsError)
          throw requestsError
        }

        setMyRequests(requests || [])

        // 出勤記録を取得
        const { data: attendances, error: attendancesError } = await supabase
          .from('attendances')
          .select('*')
          .eq('user_id', userProfile.id)
          .order('date', { ascending: false })

        if (attendancesError) {
          console.error('[CorrectionRequestPage] 出勤記録取得エラー:', attendancesError)
        }

        setAvailableDates(attendances || [])
      } catch (err) {
        console.error('[CorrectionRequestPage] エラー:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (userProfile?.id) {
      fetchData()

      // Realtime リスナーを設定
      const channel = supabase
        .channel(`corrections:${userProfile.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'corrections',
            filter: `user_id=eq.${userProfile.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              // 新しい申請が追加された（手動リロードとの二重反映を防ぐため id で重複排除）
              const inserted = payload.new as CorrectionRequest
              setMyRequests((prev) =>
                prev.some((req) => req.id === inserted.id) ? prev : [inserted, ...prev]
              )
            } else if (payload.eventType === 'UPDATE') {
              // 既存の申請が更新された（承認・却下）
              setMyRequests((prev) =>
                prev.map((req) => (req.id === payload.new.id ? (payload.new as CorrectionRequest) : req))
              )
            } else if (payload.eventType === 'DELETE') {
              // 申請が削除された
              setMyRequests((prev) => prev.filter((req) => req.id !== payload.old.id))
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [userProfile?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!userProfile?.id || !newRequest.attendanceId) {
      return
    }

    // バリデーション
    const trimmedReason = newRequest.reason.trim()
    if (!trimmedReason) {
      setFormError('修正理由を入力してください')
      return
    }
    if (!newRequest.correctedCheckIn && !newRequest.correctedCheckOut) {
      setFormError('修正後の出勤・退勤時刻を少なくとも1つ入力してください')
      return
    }

    setIsSubmitting(true)

    try {
      // 変更前の時刻を保存するため、対象の勤怠記録を参照する
      const selected = availableDates.find((att) => att.id === newRequest.attendanceId)

      const { error: insertError } = await supabase
        .from('corrections')
        .insert({
          user_id: userProfile.id,
          attendance_id: newRequest.attendanceId,
          original_check_in: selected?.check_in_time ?? null,
          original_check_out: selected?.check_out_time ?? null,
          corrected_check_in: newRequest.correctedCheckIn || null,
          corrected_check_out: newRequest.correctedCheckOut || null,
          reason: trimmedReason,
          status: 'pending',
        })

      if (insertError) {
        console.error('[CorrectionRequestPage] INSERT エラー:', insertError)
        throw insertError
      }

      // リロード
      const { data, error: reloadError } = await supabase
        .from('corrections')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })

      if (reloadError) {
        console.error('[CorrectionRequestPage] リロードエラー:', reloadError)
      } else {
        setMyRequests(data || [])
      }

      setNewRequest({
        attendanceId: '',
        correctedCheckIn: '',
        correctedCheckOut: '',
        reason: '',
      })
      setShowNewRequestForm(false)
    } catch (err) {
      console.error('[CorrectionRequestPage] 送信エラー:', err)
      setFormError('申請の送信に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (request: CorrectionRequest) => {
    setEditingId(request.id)
    setEditingRequest({
      corrected_check_in: request.corrected_check_in,
      corrected_check_out: request.corrected_check_out,
      reason: request.reason,
    })
  }

  const handleSaveEdit = async () => {
    if (!editingId) return

    setIsSubmitting(true)

    try {
      const { error: updateError } = await supabase
        .from('corrections')
        .update({
          corrected_check_in: editingRequest.corrected_check_in || null,
          corrected_check_out: editingRequest.corrected_check_out || null,
          reason: editingRequest.reason,
        })
        .eq('id', editingId)

      if (updateError) throw updateError

      // リロード
      const { data, error: reloadError } = await supabase
        .from('corrections')
        .select('*')
        .eq('user_id', userProfile?.id)
        .order('created_at', { ascending: false })

      if (reloadError) {
        console.error('[CorrectionRequestPage] リロードエラー:', reloadError)
      } else {
        setMyRequests(data || [])
      }

      setEditingId(null)
      setEditingRequest({})
    } catch (err) {
      console.error('[CorrectionRequestPage] 編集エラー:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (requestId: string) => {
    if (!confirm('この修正申請を削除しますか？')) return

    try {
      const { error: deleteError } = await supabase
        .from('corrections')
        .delete()
        .eq('id', requestId)

      if (deleteError) throw deleteError

      setMyRequests((prev) => prev.filter((req) => req.id !== requestId))
    } catch (err) {
      console.error('[CorrectionRequestPage] 削除エラー:', err)
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
        <h1 className="page-title text-lg sm:text-2xl">修正申請</h1>
        <p className="text-sm text-gray-600 mt-1">勤怠情報の修正を申請できます</p>
      </div>


      <div className="flex gap-2">
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
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {formError}
                </div>
              )}
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

      {/* 待機中の修正申請 */}
      <Card>
        <CardHeader>
          <CardTitle>待機中の修正申請</CardTitle>
          <CardDescription>{pendingRequests.length}件</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">待機中の修正申請がありません</p>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  {editingId === request.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">修正理由</label>
                        <textarea
                          value={editingRequest.reason || ''}
                          onChange={(e) =>
                            setEditingRequest({ ...editingRequest, reason: e.target.value })
                          }
                          className="w-full p-2 border rounded mt-1"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">修正後 出勤時刻</label>
                          <input
                            type="time"
                            value={editingRequest.corrected_check_in || ''}
                            onChange={(e) =>
                              setEditingRequest({
                                ...editingRequest,
                                corrected_check_in: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">修正後 退勤時刻</label>
                          <input
                            type="time"
                            value={editingRequest.corrected_check_out || ''}
                            onChange={(e) =>
                              setEditingRequest({
                                ...editingRequest,
                                corrected_check_out: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit} disabled={isSubmitting}>
                          {isSubmitting ? '保存中...' : '保存'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                          disabled={isSubmitting}
                        >
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm">修正理由</p>
                          <p className="text-sm text-gray-700 bg-white border border-yellow-300 rounded p-2 mt-1">
                            {request.reason}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            申請日: {request.created_at
                              ? new Date(request.created_at).toLocaleDateString('ja-JP')
                              : '日時不明'}
                          </p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">待機中</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEdit(request)}>
                          編集
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(request.id)}
                        >
                          削除
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 完了した修正申請 */}
      {completedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>完了した修正申請</CardTitle>
            <CardDescription>{completedRequests.length}件</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedRequests.map((request) => (
                <div
                  key={request.id}
                  className={`border rounded-lg p-4 ${
                    request.status === 'approved'
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm">修正理由</p>
                      <p className="text-sm text-gray-700 bg-white rounded p-2 mt-1">
                        {request.reason}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        申請日: {request.created_at
                          ? new Date(request.created_at).toLocaleDateString('ja-JP')
                          : '日時不明'}
                      </p>
                    </div>
                    <Badge
                      className={
                        request.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {request.status === 'approved' ? '承認済み' : '却下'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

CorrectionRequestPage.displayName = 'CorrectionRequestPage'
