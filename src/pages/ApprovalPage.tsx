import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { CorrectionRequest, RequestStatus } from '@/types'

export const ApprovalPage: React.FC = () => {
  const { userProfile } = useAuth()
  const [approvals, setApprovals] = useState<CorrectionRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setIsLoading(true)

        if (!userProfile?.id || userProfile?.department_id === undefined) {
          setError('ユーザー情報が取得できません')
          return
        }

        // マネージャーの場合は部署内の申請、管理者の場合は全て取得
        let query = supabase
          .from('correction_requests')
          .select('*, users!inner(name, department_id)')
          .eq('status', RequestStatus.PENDING)

        if (userProfile.role === 'manager') {
          query = query.eq('users.department_id', userProfile.department_id)
        } else if (userProfile.role !== 'admin') {
          setError('承認権限がありません')
          return
        }

        const { data, error: fetchError } = await query

        if (fetchError) throw fetchError

        setApprovals(
          (data || []).map((req: any) => ({
            id: req.id,
            userId: req.user_id,
            userName: req.users?.name || '不明',
            attendanceDate: req.attendance_id,
            originalCheckIn: req.original_check_in,
            correctedCheckIn: req.corrected_check_in,
            originalCheckOut: req.original_check_out,
            correctedCheckOut: req.corrected_check_out,
            reason: req.reason,
            status: req.status,
            userInitials: (req.users?.name || '')
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase(),
          }))
        )
      } catch (err) {
        console.error('Failed to fetch approvals:', err)
        setError('承認待ち情報の読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    if (userProfile?.id) {
      fetchApprovals()
    }
  }, [userProfile?.id, userProfile?.role, userProfile?.department_id])

  const handleApprove = async (requestId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('correction_requests')
        .update({ status: RequestStatus.APPROVED })
        .eq('id', requestId)

      if (updateError) throw updateError

      setApprovals((prev) => prev.filter((a) => a.id !== requestId))
    } catch (err) {
      console.error('Failed to approve:', err)
      setError('承認に失敗しました')
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('correction_requests')
        .update({ status: RequestStatus.REJECTED })
        .eq('id', requestId)

      if (updateError) throw updateError

      setApprovals((prev) => prev.filter((a) => a.id !== requestId))
    } catch (err) {
      console.error('Failed to reject:', err)
      setError('却下に失敗しました')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">承認待ちを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="page-title text-lg sm:text-2xl">承認待ち</h1>
          <p className="text-sm text-gray-600 mt-1">修正申請を確認・承認できます</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="page-title text-lg sm:text-2xl">承認待ち</h1>
        <p className="text-sm text-gray-600 mt-1">修正申請を確認・承認できます</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>保留中の申請</CardTitle>
          <CardDescription>{approvals.length}件</CardDescription>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">承認待ち申請がありません</p>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval) => (
                <div key={approval.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">申請者</p>
                      <p className="font-medium">{approval.userName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">対象日</p>
                      <p className="font-medium">{approval.attendanceDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">修正内容</p>
                      <p className="font-medium text-sm">
                        出勤: {approval.originalCheckIn} → {approval.correctedCheckIn}
                      </p>
                      <p className="font-medium text-sm">
                        退勤: {approval.originalCheckOut} → {approval.correctedCheckOut}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">理由</p>
                      <p className="font-medium">{approval.reason}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(approval.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      却下
                    </Button>
                    <Button size="sm" onClick={() => handleApprove(approval.id)}>
                      承認
                    </Button>
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

ApprovalPage.displayName = 'ApprovalPage'
