import { supabase } from '@/lib/supabase'

export const attendanceService = {
  async getAttendances(userId: string, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`

    const { data, error } = await supabase
      .from('attendances')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  },

  async checkIn(userId: string, workType: string) {
    const now = new Date()
    const checkInTime = now.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    const { data, error } = await supabase
      .from('attendances')
      .insert([
        {
          user_id: userId,
          date: now.toISOString().split('T')[0],
          check_in_time: checkInTime,
          work_type: workType,
          status: 'working',
        },
      ])
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return data?.[0] || null
  },

  async checkOut(attendanceId: string) {
    const now = new Date()
    const checkOutTime = now.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    const { data, error } = await supabase
      .from('attendances')
      .update({
        check_out_time: checkOutTime,
        status: 'pending',
      })
      .eq('id', attendanceId)
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return data?.[0] || null
  },

  async addBreakTime(
    attendanceId: string,
    breakTimes: Array<{ startTime: string; endTime: string | null }>
  ) {
    const { data, error } = await supabase
      .from('attendances')
      .update({
        break_times: breakTimes,
      })
      .eq('id', attendanceId)
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return data?.[0] || null
  },
}
