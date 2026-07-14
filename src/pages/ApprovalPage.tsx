import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Correction, UserRole } from '@/types'

type StatusTab = 'pending' | 'approved' | 'rejected'

type ApprovalItem = Correction & { userName: string }

export const ApprovalPage: React.FC = () => {
  const { userProfile } = useAuth()
  const [allApprovals, setAllApprovals] = useState<ApprovalItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTab, setSelectedTab] = useState<StatusTab>('pending')

  const isAdmin = userProfile?.role === UserRole.ADMIN

  const filteredApprovals = allApprovals.filter((a) => a.status === selectedTab)

  useEffect(() => {
    let ignore = false

    const fetchApprovals = async () => {
      try {
        setIsLoading(true)

        const { data, error: fetchError } = await supabase
          .from('corrections')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) {
          console.error('[ApprovalPage] クエリエラー:', fetchError)
          throw fetchError
        }

        // 申請者名を一括取得（N+1 回避）
        let withUserNames: ApprovalItem[] = []
        if (data && data.length > 0) {
          const userIds = [...new Set(data.map((c) => c.user_id))]
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', userIds)

          if (profilesError) {
            console.error('[ApprovalPage] プロフィール取得エラー:', profilesError)
          }

          withUserNames = data.map((correction) => ({
            ...correction,
            userName: profilesData?.find((p) => p.id === correction.user_id)?.name || '不明',
          }))
        }

        if (!ignore) setAllApprovals(withUserNames)
      } catch (err) {
        console.error('[ApprovalPage] エラー:', err)
        if (!ignore) setError('修正申請の読み込みに失敗しました')
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    if (!userProfile?.id) return

    // 管理者以外はデータ取得自体を行わない
    if (isAdmin) {
      fetchApprovals()
    } else {
      setIsLoading(false)
    }

    return () => {
      ignore = true
    }
  }, [userProfile?.id, userProfile?.role, isAdmin])

  const handleApprove = async (approval: ApprovalItem) => {
    if (!isAdmin) {
      setError('管理者のみが承認できます')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      const { error: updateError } = await supabase
        .from('corrections')
        .update({
          status: 'approved',
          approver_id: userProfile?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', approval.id)

      if (updateError) throw updateError

      // 承認内容を実際の勤怠記録に反映する
      const patch: Record<string, string> = {}
      if (approval.corrected_check_in) patch.check_in_time = approval.corrected_check_in
      if (approval.corrected_check_out) patch.check_out_time = approval.corrected_check_out

      if (approval.attendance_id && Object.keys(patch).length > 0) {
        const { error: attendanceError } = await supabase
          .from('attendances')
          .update(patch)
          .eq('id', approval.attendance_id)

        if (attendanceError) {
          console.error('[ApprovalPage] 勤怠反映エラー:', attendanceError)
          setError('承認しましたが、勤怠記録への反映に失敗しました')
        }
      }

      setAllApprovals((prev) =>
        prev.map((a) => (a.id === approval.id ? { ...a, status: 'approved' } : a))
      )
    } catch (err) {
      console.error('[ApprovalPage] 承認エラー:', err)
      setError('承認に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async (approval: ApprovalItem) => {
    if (!isAdmin) {
      setError('管理者のみが却下できます')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      const { error: updateError } = await supabase
        .from('corrections')
        .update({
          status: 'rejected',
          approver_id: userProfile?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', approval.id)

      if (updateError) throw updateError

      setAllApprovals((prev) =>
        prev.map((a) => (a.id === approval.id ? { ...a, status: 'rejected' } : a))
      )
    } catch (err) {
      console.error('[ApprovalPage] 却下エラー:', err)
      setError('却下に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">承認待ちを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="page-title text-lg sm:text-2xl">承認待ち</h1>
          <p className="text-sm text-gray-600 mt-1">修正申請を確認・承認できます</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
          このページは管理者のみ利用できます
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* ステータスタブ */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTab('pending')}
              className={selectedTab === 'pending' ? 'bg-yellow-100' : ''}
            >
              待機中 ({allApprovals.filter((a) => a.status === 'pending').length}件)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTab('approved')}
              className={selectedTab === 'approved' ? 'bg-green-100' : ''}
            >
              承認済み ({allApprovals.filter((a) => a.status === 'approved').length}件)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTab('rejected')}
              className={selectedTab === 'rejected' ? 'bg-red-100' : ''}
            >
              却下 ({allApprovals.filter((a) => a.status === 'rejected').length}件)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>修正申請一覧</CardTitle>
          <CardDescription>
            {selectedTab === 'pending'
              ? `待機中の申請 ${filteredApprovals.length}件`
              : selectedTab === 'approved'
              ? `承認済みの申請 ${filteredApprovals.length}件`
              : `却下された申請 ${filteredApprovals.length}件`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApprovals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">申請がありません</p>
          ) : (
            <div className="space-y-4">
              {filteredApprovals.map((approval) => (
                <div key={approval.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 font-medium">申請者</p>
                          <p className="text-sm sm:text-base font-medium">{approval.userName}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 font-medium">申請日</p>
                          <p className="text-sm">
                            {approval.created_at
                              ? new Date(approval.created_at).toLocaleDateString('ja-JP')
                              : '不明'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 font-medium">修正理由</p>
                        <p className="text-sm">
                          {approval.reason}
                        </p>
                      </div>

                      {(approval.original_check_in || approval.corrected_check_in) && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 font-medium">出勤時刻</p>
                          <p className="text-sm">
                            <span className="line-through text-gray-500">{approval.original_check_in || '-'}</span>
                            {' → '}
                            <span className="font-semibold text-primary">{approval.corrected_check_in || '-'}</span>
                          </p>
                        </div>
                      )}

                      {(approval.original_check_out || approval.corrected_check_out) && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 font-medium">退勤時刻</p>
                          <p className="text-sm">
                            <span className="line-through text-gray-500">{approval.original_check_out || '-'}</span>
                            {' → '}
                            <span className="font-semibold text-primary">{approval.corrected_check_out || '-'}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {selectedTab === 'pending' && (
                      <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(approval)}
                          disabled={isSubmitting}
                          className="text-red-600 hover:text-red-700"
                        >
                          却下
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(approval)}
                          disabled={isSubmitting}
                        >
                          承認
                        </Button>
                      </div>
                    )}

                    {(selectedTab === 'approved' || selectedTab === 'rejected') && (
                      <Badge
                        className={
                          selectedTab === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {selectedTab === 'approved' ? '承認済み' : '却下'}
                      </Badge>
                    )}
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
