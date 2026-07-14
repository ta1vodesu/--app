import React from 'react'
import { Badge } from '@/components/ui/badge'
import { AttendanceStatus, CorrectionStatus } from '@/types'

interface StatusBadgeProps {
  status: AttendanceStatus | CorrectionStatus
}

const statusConfig: Record<string, { label: string; variant: any }> = {
  [AttendanceStatus.WORKING]: { label: '出勤中', variant: 'working' },
  [AttendanceStatus.HOLIDAY]: { label: '休日', variant: 'holiday' },
  [AttendanceStatus.ABSENT]: { label: '不在', variant: 'holiday' },
  [CorrectionStatus.APPROVED]: { label: '承認済み', variant: 'approved' },
  [CorrectionStatus.REJECTED]: { label: '却下', variant: 'rejected' },
  'pending': { label: '待機中', variant: 'pending' },
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || { label: status, variant: 'default' }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

StatusBadge.displayName = 'StatusBadge'
