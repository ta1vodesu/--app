export const parseWorkingHours = (workingHours: string | number): number | null => {
  if (!workingHours) return null

  if (typeof workingHours === 'number') {
    return workingHours * 60
  }

  const str = workingHours.toString().trim()

  // Format: "8h30m" or "8:30" or "8.5"
  const hm = str.match(/^(\d+\.?\d*)h?(?::(\d+))?m?$/)
  if (hm) {
    const h = parseInt(hm[1], 10)
    const m = hm[2] ? parseInt(hm[2], 10) : 0
    return h * 60 + m
  }

  const decimal = parseFloat(str)
  if (!isNaN(decimal)) {
    return decimal * 60
  }

  return null
}

export const calculateAverageWorkingHours = (attendanceData: any[]): string => {
  if (!attendanceData || attendanceData.length === 0) {
    return '-'
  }

  let totalMinutes = 0
  let count = 0

  for (const record of attendanceData) {
    if (!record.working_hours) continue

    const hours = parseWorkingHours(record.working_hours)
    if (hours !== null) {
      totalMinutes += hours
      count++
    }
  }

  if (count === 0) {
    return '-'
  }

  const avgMinutes = Math.round(totalMinutes / count)
  const hours = Math.floor(avgMinutes / 60)
  const minutes = avgMinutes % 60

  return `${hours}h${minutes}m`
}

export const formatOvertime = (totalMinutes: number): number => {
  return Math.round((totalMinutes / 60) * 10) / 10
}

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
  status: 'working' | 'holiday' | 'absent' | 'pending'
}

export const calculateMonthlyStats = (attendanceData: any[]): MonthlyStats => {
  let totalWorkingMinutes = 0
  let totalOvertimeMinutes = 0
  let workingDays = 0
  let absentDays = 0
  let holidayDays = 0

  for (const record of attendanceData) {
    // 'working' または 'worked' は勤務日
    if (record.status === 'working' || record.status === 'worked') {
      workingDays++

      // 勤務時間を計算（check_in_time と check_out_time から）
      if (record.check_in_time && record.check_out_time) {
        const hours = calculateWorkingHours(record.check_in_time, record.check_out_time)
        if (hours > 0) {
          totalWorkingMinutes += Math.round(hours * 60)
        }
      } else if (record.working_hours) {
        // フォールバック：working_hours が設定されている場合
        const hours = parseWorkingHours(record.working_hours)
        if (hours !== null) {
          totalWorkingMinutes += hours
        }
      }

      if (record.overtime) {
        const overtime = parseWorkingHours(record.overtime)
        if (overtime !== null) {
          totalOvertimeMinutes += overtime
        }
      }
    } else if (record.status === 'absent') {
      absentDays++
    } else if (record.status === 'holiday') {
      holidayDays++
    }
  }

  const totalWorkingHours = formatMinutesToTime(totalWorkingMinutes)
  const totalOvertime = formatMinutesToTime(totalOvertimeMinutes)
  const averageWorkingHours = workingDays > 0
    ? formatMinutesToTime(Math.round(totalWorkingMinutes / workingDays))
    : '-'

  return {
    totalWorkingDays: workingDays,
    totalWorkingHours,
    totalOvertime,
    averageWorkingHours,
    absentDays,
    holidayDays,
  }
}

export const convertAttendanceToDailyReport = (attendanceData: any[]): DailyReportData[] => {
  return attendanceData.map((record) => {
    const date = new Date(record.date)
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]

    return {
      date: record.date,
      dayOfWeek,
      checkIn: record.check_in_time || '-',
      checkOut: record.check_out_time || '-',
      workingHours: record.working_hours || '-',
      breakTime: record.break_time || '-',
      overtime: record.overtime || '-',
      status: record.status || 'pending',
    }
  })
}

const formatMinutesToTime = (minutes: number): string => {
  if (minutes === 0) return '-'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  // 時間と分の両方がある場合
  if (hours > 0 && mins > 0) {
    return `${hours}h${mins}m`
  }
  // 時間のみ
  if (hours > 0) {
    return `${hours}h`
  }
  // 分のみ
  return `${mins}m`
}

const calculateWorkingHours = (checkInTime: string, checkOutTime: string): number => {
  if (!checkInTime || !checkOutTime) return 0
  try {
    const [inHour, inMin] = checkInTime.split(':').map(Number)
    const [outHour, outMin] = checkOutTime.split(':').map(Number)
    const inMinutes = inHour * 60 + inMin
    const outMinutes = outHour * 60 + outMin
    const diff = outMinutes - inMinutes
    return diff > 0 ? diff / 60 : 0
  } catch {
    return 0
  }
}
