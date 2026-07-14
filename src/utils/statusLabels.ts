// 状態値を日本語ラベルに変換

export const getStatusLabel = (status: string | null | undefined): string => {
  switch (status) {
    // 修正申請・承認状態
    case 'pending':
      return '待機中'
    case 'approved':
      return '承認済み'
    case 'rejected':
      return '却下'

    // 勤怠状態
    case 'working':
      return '出勤中'
    case 'worked':
      return '退勤済み'
    case 'holiday':
      return '休日'
    case 'absent':
      return '欠勤'

    default:
      return status || '-'
  }
}

export const getStatusColor = (status: string | null | undefined): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'working':
      return 'bg-green-100 text-green-800'
    case 'worked':
      return 'bg-blue-100 text-blue-800'
    case 'holiday':
      return 'bg-gray-100 text-gray-800'
    case 'absent':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getStatusVariant = (
  status: string | null | undefined
): 'default' | 'working' | 'holiday' | 'pending' | 'approved' | 'rejected' => {
  switch (status) {
    case 'working':
      return 'working'
    case 'worked':
      return 'default'
    case 'holiday':
      return 'holiday'
    case 'pending':
      return 'pending'
    case 'approved':
      return 'approved'
    case 'rejected':
      return 'rejected'
    default:
      return 'default'
  }
}
