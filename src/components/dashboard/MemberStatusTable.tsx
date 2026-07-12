import React from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { MemberStatus } from '@/types'

interface MemberStatusTableProps {
  members: MemberStatus[]
  isLoading?: boolean
}

export const MemberStatusTable: React.FC<MemberStatusTableProps> = ({
  members,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <EmptyState
        icon="👥"
        title="メンバーがいません"
        description="部署にメンバーが登録されていません。"
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名前</TableHead>
            <TableHead>今日</TableHead>
            <TableHead>出勤時刻</TableHead>
            <TableHead>退勤時刻</TableHead>
            <TableHead>勤務時間</TableHead>
            <TableHead>残業</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 bg-blue-100">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                    {member.initials || member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {member.name}
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge status={member.status} />
            </TableCell>
            <TableCell>{member.checkInTime || '-'}</TableCell>
            <TableCell>{member.checkOutTime || '-'}</TableCell>
            <TableCell>{member.workingHours || '-'}</TableCell>
            <TableCell className="text-orange-600">{member.overtime || '-'}</TableCell>
          </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

MemberStatusTable.displayName = 'MemberStatusTable'
