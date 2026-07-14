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
    if (record.status === 'working') {
      workingDays++

      if (record.working_hours) {
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
  if (minutes === 0) return '0h00m'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h${mins.toString().padStart(2, '0')}m`
}
