import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { CorrectionRequest, RequestStatus } from '@/types'

export const CorrectionRequestPage: React.FC = () => {
  const { userProfile } = useAuth()
  const [myRequests, setMyRequests] = useState<CorrectionRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [newRequest, setNewRequest] = useState({
    attendanceDate: '',
    originalCheckIn: '',
    correctedCheckIn: '',
    originalCheckOut: '',
    correctedCheckOut: '',
    reason: '',
  })

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true)

        if (!userProfile?.id) {
          setError('ユーザー情報が取得できません')
          return
        }

        const { data, error: fetchError } = await supabase
          .from('correction_requests')
          .select('*')
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        setMyRequests(
          (data || []).map((req) => ({
            id: req.id,
            userId: req.user_id,
            userName: userProfile.name,
            attendanceDate: req.attendance_id,
            originalCheckIn: req.original_check_in,
            correctedCheckIn: req.corrected_check_in,
            originalCheckOut: req.original_check_out,
            correctedCheckOut: req.corrected_check_out,
            reason: req.reason,
            status: req.status,
            userInitials: userProfile.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase(),
          }))
        )
      } catch (err) {
        console.error('Failed to fetch correction requests:', err)
        setError('修正申請の読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    if (userProfile?.id) {
      fetchRequests()
    }
  }, [userProfile?.id, userProfile?.name])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userProfile?.id) {
      setError('ユーザー情報が取得できません')
      return
    }

    try {
      const { error: insertError } = await supabase.from('correction_requests').insert({
        user_id: userProfile.id,
        attendance_id: newRequest.attendanceDate,
        original_check_in: newRequest.originalCheckIn || null,
        corrected_check_in: newRequest.correctedCheckIn || null,
        original_check_out: newRequest.originalCheckOut || null,
        corrected_check_out: newRequest.correctedCheckOut || null,
        reason: newRequest.reason,
        status: RequestStatus.PENDING,
      })

      if (insertError) throw insertError

      setNewRequest({
        attendanceDate: '',
        originalCheckIn: '',
        correctedCheckIn: '',
        originalCheckOut: '',
        correctedCheckOut: '',
        reason: '',
      })

      // リスト更新
      const { data, error: fetchError } = await supabase
        .from('correction_requests')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })

      if (!fetchError && data) {
        setMyRequests(
          data.map((req) => ({
            id: req.id,
            userId: req.user_id,
            userName: userProfile.name,
            attendanceDate: req.attendance_id,
            originalCheckIn: req.original_check_in,
            correctedCheckIn: req.corrected_check_in,
            originalCheckOut: req.original_check_out,
            correctedCheckOut: req.corrected_check_out,
            reason: req.reason,
            status: req.status,
            userInitials: userProfile.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase(),
          }))
        )
      }
    } catch (err) {
      console.error('Failed to submit request:', err)
      setError('修正申請の提出に失敗しました')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">修正申請を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="page-title text-lg sm:text-2xl">修正申請</h1>
        <p className="text-sm text-gray-600 mt-1">勤怠記録の修正を申請できます</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>新規申請</CardTitle>
          <CardDescription>修正内容を入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">対象日付</label>
                <input
                  type="date"
                  value={newRequest.attendanceDate}
                  onChange={(e) => setNewRequest({ ...newRequest, attendanceDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">修正理由</label>
                <input
                  type="text"
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  placeholder="打刻機の不具合"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              <div>
                <label className="block font-medium mb-1">元の出勤時刻</label>
                <input
                  type="time"
                  value={newRequest.originalCheckIn}
                  onChange={(e) => setNewRequest({ ...newRequest, originalCheckIn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">修正出勤時刻</label>
                <input
                  type="time"
                  value={newRequest.correctedCheckIn}
                  onChange={(e) => setNewRequest({ ...newRequest, correctedCheckIn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">元の退勤時刻</label>
                <input
                  type="time"
                  value={newRequest.originalCheckOut}
                  onChange={(e) => setNewRequest({ ...newRequest, originalCheckOut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">修正退勤時刻</label>
                <input
                  type="time"
                  value={newRequest.correctedCheckOut}
                  onChange={(e) => setNewRequest({ ...newRequest, correctedCheckOut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              申請する
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>申請履歴</CardTitle>
          <CardDescription>あなたの修正申請一覧</CardDescription>
        </CardHeader>
        <CardContent>
          {myRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">申請がありません</p>
          ) : (
            <div className="space-y-3">
              {myRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{request.attendanceDate}</p>
                      <p className="text-sm text-gray-600 mt-1">{request.reason}</p>
                    </div>
                    <Badge
                      variant={
                        request.status === RequestStatus.APPROVED
                          ? 'default'
                          : request.status === RequestStatus.REJECTED
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
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
