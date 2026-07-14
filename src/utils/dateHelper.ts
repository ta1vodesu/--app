// 日付・時刻ユーティリティ（勤怠はすべて日本時間 = Asia/Tokyo 基準）

const JST_TIMEZONE = 'Asia/Tokyo'

export const formatYMD = (year: number, month1: number, day: number): string =>
  `${year}-${String(month1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

// 今日の日付（JST）を YYYY-MM-DD で返す
export const getTodayJST = (): string =>
  new Date().toLocaleDateString('en-CA', { timeZone: JST_TIMEZONE })

// 指定月の開始日・終了日（month0 は 0 始まり）
export const getMonthRange = (year: number, month0: number): { start: string; end: string } => {
  const lastDay = new Date(year, month0 + 1, 0).getDate()
  return {
    start: formatYMD(year, month0 + 1, 1),
    end: formatYMD(year, month0 + 1, lastDay),
  }
}

// 月初から指定日までの営業日数（月〜金）を数える
export const countElapsedBusinessDays = (year: number, month0: number, uptoDay: number): number => {
  const lastDay = new Date(year, month0 + 1, 0).getDate()
  const limit = Math.min(uptoDay, lastDay)
  let count = 0
  for (let day = 1; day <= limit; day++) {
    const weekday = new Date(year, month0, day).getDay()
    if (weekday !== 0 && weekday !== 6) count++
  }
  return count
}

// "HH:MM(:SS)" 形式の出退勤時刻から勤務時間（分）を計算（日跨ぎは翌日退勤として扱う）
export const calculateWorkingMinutes = (
  checkIn: string | null | undefined,
  checkOut: string | null | undefined
): number => {
  if (!checkIn || !checkOut) return 0
  const [inHour, inMin] = checkIn.split(':').map(Number)
  const [outHour, outMin] = checkOut.split(':').map(Number)
  if ([inHour, inMin, outHour, outMin].some((n) => Number.isNaN(n))) return 0
  const inMinutes = inHour * 60 + inMin
  let outMinutes = outHour * 60 + outMin
  if (outMinutes < inMinutes) outMinutes += 24 * 60
  return outMinutes - inMinutes
}

// 分を "8h30m" 形式に整形（0 以下は "-"）
export const formatMinutesToHM = (minutes: number): string => {
  if (minutes <= 0) return '-'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0 && mins > 0) return `${hours}h${mins}m`
  if (hours > 0) return `${hours}h`
  return `${mins}m`
}
