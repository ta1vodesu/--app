import { calculateWorkingMinutes, formatMinutesToHM } from './dateHelper'

export type NormalizedStatus = 'working' | 'holiday' | 'absent' | 'pending'

export interface AttendanceRecordLike {
  date: string
  check_in_time?: string | null
  check_out_time?: string | null
  working_hours?: string | null
  break_time?: string | null
  status?: string | null
}

// DB には 'working' / 'worked' / 'completed' / 'approved' / 'pending' 等が混在するため、
// 表示・集計は「打刻の実績」に基づいて正規化する
export const normalizeAttendanceStatus = (record: AttendanceRecordLike): NormalizedStatus => {
  if (record.status === 'holiday') return 'holiday'
  if (record.status === 'absent') return 'absent'
  if (record.check_in_time) return 'working'
  return 'pending'
}

// "8h30m" / "8h" / "8:30" / "8.5" を分に変換
const parseWorkingHoursToMinutes = (
  workingHours: string | number | null | undefined
): number | null => {
  if (workingHours === null || workingHours === undefined || workingHours === '') return null
  if (typeof workingHours === 'number') return Math.round(workingHours * 60)

  const str = workingHours.toString().trim()

  const hm = str.match(/^(\d+)h(?:(\d+)m?)?$/)
  if (hm) return parseInt(hm[1], 10) * 60 + (hm[2] ? parseInt(hm[2], 10) : 0)

  const colon = str.match(/^(\d+):(\d+)$/)
  if (colon) return parseInt(colon[1], 10) * 60 + parseInt(colon[2], 10)

  const decimal = parseFloat(str)
  if (!isNaN(decimal)) return Math.round(decimal * 60)

  return null
}

// 打刻から勤務時間（分）を求める。打刻がない場合は working_hours 文字列にフォールバック
const getRecordWorkingMinutes = (record: AttendanceRecordLike): number => {
  if (record.check_in_time && record.check_out_time) {
    const minutes = calculateWorkingMinutes(record.check_in_time, record.check_out_time)
    if (minutes > 0) return minutes
  }
  return parseWorkingHoursToMinutes(record.working_hours) ?? 0
}

const STANDARD_WORKING_MINUTES = 480 // 所定労働 8 時間

export interface MonthlyStats {
  totalWorkingDays: number
  totalWorkingHours: string
  totalOvertime: string
  averageWorkingHours: string
  absentDays: number
  holidayDays: number
}

export interface DailyReportData {
  date: string
  dayOfWeek: string
  checkIn: string
  checkOut: string
  workingHours: string
  breakTime: string
  overtime: string
  status: NormalizedStatus
}

export const calculateMonthlyStats = (attendanceData: AttendanceRecordLike[]): MonthlyStats => {
  let totalWorkingMinutes = 0
  let totalOvertimeMinutes = 0
  let workingDays = 0
  let absentDays = 0
  let holidayDays = 0

  for (const record of attendanceData) {
    const status = normalizeAttendanceStatus(record)
    if (status === 'working') {
      workingDays++
      const minutes = getRecordWorkingMinutes(record)
      totalWorkingMinutes += minutes
      totalOvertimeMinutes += Math.max(0, minutes - STANDARD_WORKING_MINUTES)
    } else if (status === 'absent') {
      absentDays++
    } else if (status === 'holiday') {
      holidayDays++
    }
  }

  return {
    totalWorkingDays: workingDays,
    totalWorkingHours: formatMinutesToHM(totalWorkingMinutes),
    totalOvertime: formatMinutesToHM(totalOvertimeMinutes),
    averageWorkingHours:
      workingDays > 0 ? formatMinutesToHM(Math.round(totalWorkingMinutes / workingDays)) : '-',
    absentDays,
    holidayDays,
  }
}

export const convertAttendanceToDailyReport = (
  attendanceData: AttendanceRecordLike[]
): DailyReportData[] => {
  return attendanceData.map((record) => {
    // "YYYY-MM-DD" を UTC 解釈させないため、要素に分解してローカルで曜日を求める
    const [year, month, day] = record.date.split('-').map(Number)
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][
      new Date(year, month - 1, day).getDay()
    ]
    const minutes = getRecordWorkingMinutes(record)
    const overtimeMinutes = Math.max(0, minutes - STANDARD_WORKING_MINUTES)

    return {
      date: record.date,
      dayOfWeek,
      checkIn: record.check_in_time || '-',
      checkOut: record.check_out_time || '-',
      workingHours: formatMinutesToHM(minutes),
      breakTime: record.break_time || '-',
      overtime: overtimeMinutes > 0 ? formatMinutesToHM(overtimeMinutes) : '-',
      status: normalizeAttendanceStatus(record),
    }
  })
}
