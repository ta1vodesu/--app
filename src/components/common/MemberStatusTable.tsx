import React from 'react'
import { MemberStatus } from '@/types'

interface MemberStatusTableProps {
  members: MemberStatus[]
}

export const MemberStatusTable: React.FC<MemberStatusTableProps> = ({ members }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working':
        return 'bg-green-100 text-green-700'
      case 'not_started':
        return 'bg-gray-100 text-gray-700'
      case 'holiday':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'working':
        return '出勤中'
      case 'not_started':
        return '未打刻'
      case 'holiday':
        return '休日'
      default:
        return status
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-3 font-medium">名前</th>
            <th className="text-left py-2 px-3 font-medium">出勤時刻</th>
            <th className="text-left py-2 px-3 font-medium">退勤時刻</th>
            <th className="text-left py-2 px-3 font-medium">勤務時間</th>
            <th className="text-left py-2 px-3 font-medium">ステータス</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                    {member.initials}
                  </div>
                  <span>{member.name}</span>
                </div>
              </td>
              <td className="py-3 px-3">{member.checkInTime}</td>
              <td className="py-3 px-3">{member.checkOutTime}</td>
              <td className="py-3 px-3">{member.workingHours}</td>
              <td className="py-3 px-3">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(member.status)}`}>
                  {getStatusLabel(member.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

MemberStatusTable.displayName = 'MemberStatusTable'
