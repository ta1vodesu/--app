import { supabase } from '@/lib/supabase'

export const correctionService = {
  async getCorrectionRequests(userId: string) {
    const { data, error } = await supabase
      .from('correction_requests')
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
      .from('correction_requests')
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
      .from('correction_requests')
      .select('*, users(name, email), attendances(date)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  },

  async approveRequest(requestId: string, approverId: string) {
    const { data, error } = await supabase
      .from('correction_requests')
      .update({ status: 'approved' })
      .eq('id', requestId)
      .select()

    if (error) {
      throw new Error(error.message)
    }

    // 承認レコードを作成
    await supabase.from('approvals').insert([
      {
        correction_request_id: requestId,
        approver_id: approverId,
        status: 'approved',
        approved_at: new Date().toISOString(),
      },
    ])

    return data?.[0] || null
  },

  async rejectRequest(requestId: string, approverId: string) {
    const { data, error } = await supabase
      .from('correction_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId)
      .select()

    if (error) {
      throw new Error(error.message)
    }

    // 却下レコードを作成
    await supabase.from('approvals').insert([
      {
        correction_request_id: requestId,
        approver_id: approverId,
        status: 'rejected',
      },
    ])

    return data?.[0] || null
  },
}
