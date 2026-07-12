import React, { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { StatusBadge } from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { Spinner } from '@/components/common/Spinner'
import { MonthNavigator } from '@/components/common/MonthNavigator'
import { CorrectionRequest, RequestStatus } from '@/types'
import { mockApprovals } from '@/data/mockData'

export const ApprovalPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [approvals, setApprovals] = useState<CorrectionRequest[]>(mockApprovals)
  const [selectedApproval, setSelectedApproval] = useState<CorrectionRequest | null>(null)
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [isLoading] = useState(false)

  const handleApprove = (id: string) => {
    const updated = approvals.map((a) =>
      a.id === id ? { ...a, status: RequestStatus.APPROVED } : a
    )
    setApprovals(updated)
    setSelectedApproval(null)
    setAction(null)
  }

  const handleReject = (id: string) => {
    const updated = approvals.map((a) =>
      a.id === id ? { ...a, status: RequestStatus.REJECTED } : a
    )
    setApprovals(updated)
    setSelectedApproval(null)
    setAction(null)
  }

  const pendingApprovals = approvals.filter(
    (a) => a.status === RequestStatus.PENDING
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="page-title text-lg sm:text-2xl">承認待ち一覧</h1>
        <p className="text-sm text-gray-600 mt-1">
          待機中: <span className="font-bold">{pendingApprovals.length}</span>件
        </p>
      </div>

      {/* 月ナビゲーター */}
      <MonthNavigator selectedDate={selectedDate} onMonthChange={setSelectedDate} />

      <Card>
        <CardHeader>
          <CardTitle>修正申請一覧</CardTitle>
          <CardDescription>
            従業員からの修正申請を確認・承認してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Spinner label="申請を読み込み中..." />
          ) : approvals.length === 0 ? (
            <EmptyState
              icon="✅"
              title="承認待ちがありません"
              description="すべての申請が処理されました。"
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>申請者</TableHead>
                    <TableHead>対象日</TableHead>
                    <TableHead>変更内容</TableHead>
                    <TableHead>理由</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvals.map((approval) => (
                <TableRow key={approval.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 bg-purple-100">
                        <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">
                          {approval.userInitials || approval.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {approval.userName}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(approval.attendanceDate).toLocaleDateString(
                      'ja-JP',
                      {
                        month: 'numeric',
                        day: 'numeric',
                      }
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {approval.originalCheckIn && approval.correctedCheckIn && (
                      <div>
                        出勤 {approval.originalCheckIn} → {approval.correctedCheckIn}
                      </div>
                    )}
                    {approval.originalCheckOut && approval.correctedCheckOut && (
                      <div>
                        退勤 {approval.originalCheckOut} → {approval.correctedCheckOut}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm max-w-xs">
                    {approval.reason}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={approval.status} />
                  </TableCell>
                  <TableCell>
                    {approval.status === RequestStatus.PENDING && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setSelectedApproval(approval)
                            setAction('approve')
                          }}
                        >
                          承認
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedApproval(approval)
                            setAction('reject')
                          }}
                        >
                          却下
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={selectedApproval !== null} onOpenChange={(open) => {
        if (!open) {
          setSelectedApproval(null)
          setAction(null)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? '申請を承認しますか？' : '申請を却下しますか？'}
            </DialogTitle>
            <DialogDescription>
              {selectedApproval?.userName} さんの修正申請
              {action === 'approve' ? '承認' : '却下'}処理
            </DialogDescription>
          </DialogHeader>

          {selectedApproval && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">申請者</p>
                  <p className="font-medium">{selectedApproval.userName}</p>
                </div>
                <div>
                  <p className="text-gray-600">対象日</p>
                  <p className="font-medium">
                    {new Date(selectedApproval.attendanceDate).toLocaleDateString(
                      'ja-JP'
                    )}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">理由</p>
                  <p className="font-medium">{selectedApproval.reason}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedApproval(null)
                setAction(null)
              }}
            >
              キャンセル
            </Button>
            {action === 'approve' && selectedApproval && (
              <Button
                onClick={() => handleApprove(selectedApproval.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                承認する
              </Button>
            )}
            {action === 'reject' && selectedApproval && (
              <Button
                variant="destructive"
                onClick={() => handleReject(selectedApproval.id)}
              >
                却下する
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

ApprovalPage.displayName = 'ApprovalPage'
