import { supabase } from '@/lib/supabase'

export const correctionService = {
  async getCorrectionRequests(userId: string) {
    const { data, error } = await supabase
      .from('corrections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  },

  async createCorrectionRequest(
    userId: string,
    attendanceId: string,
    changes: {
      originalCheckIn?: string
      correctedCheckIn?: string
      originalCheckOut?: string
      correctedCheckOut?: string
    },
    reason: string
  ) {
    const { data, error } = await supabase
      .from('corrections')
      .insert([
        {
          user_id: userId,
          attendance_id: attendanceId,
          original_check_in: changes.originalCheckIn,
          corrected_check_in: changes.correctedCheckIn,
          original_check_out: changes.originalCheckOut,
          corrected_check_out: changes.correctedCheckOut,
          reason,
          status: 'pending',
        },
      ])
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return data?.[0] || null
  },

  async getPendingRequests() {
    const { data, error } = await supabase
      .from('corrections')
      .select('*, profiles(name, email), attendances(date)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  },

  async approveRequest(requestId: string, approverId: string, note?: string) {
    const { data, error } = await supabase
      .from('corrections')
      .update({
        status: 'approved',
        approver_id: approverId,
        approval_note: note,
        approved_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return data?.[0] || null
  },

  async rejectRequest(requestId: string, approverId: string, note?: string) {
    const { data, error } = await supabase
      .from('corrections')
      .update({
        status: 'rejected',
        approver_id: approverId,
        approval_note: note,
      })
      .eq('id', requestId)
      .select()

    if (error) {
      throw new Error(error.message)
    }

    return data?.[0] || null
  },
}
