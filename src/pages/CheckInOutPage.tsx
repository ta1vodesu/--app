import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

export const CheckInOutPage: React.FC = () => {
  const { userProfile } = useAuth()
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkedInTime, setCheckedInTime] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentDate, setCurrentDate] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // 毎秒時刻を更新
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Tokyo',
      })
      const dateStr = now.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        timeZone: 'Asia/Tokyo',
      })
      setCurrentTime(timeStr)
      setCurrentDate(dateStr)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // 本日の勤怠情報を取得
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      if (!userProfile?.id) return

      try {
        const now = new Date()
        const dateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Tokyo' }) // YYYY-MM-DD

        const { data, error: fetchError } = await supabase
          .from('attendances')
          .select('*')
          .eq('user_id', userProfile.id)
          .eq('date', dateStr)
          .single()
          .catch(() => ({ data: null, error: null }))

        if (data) {
          setIsCheckedIn(!!data.check_in_time)
          if (data.check_in_time) {
            setCheckedInTime(data.check_in_time)
          }
        }
      } catch (err) {
        console.error('Failed to fetch attendance:', err)
      }
    }

    fetchTodayAttendance()
  }, [userProfile?.id])

  const handleCheckIn = async () => {
    if (!userProfile?.id) {
      setError('ユーザー情報が取得できません')
      return
    }

    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const now = new Date()
      const dateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Tokyo' })
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Tokyo',
      })

      // 本日の勤怠情報を取得
      const { data: existing, error: fetchError } = await supabase
        .from('attendances')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('date', dateStr)
        .single()
        .catch(() => ({ data: null, error: null }))

      if (existing) {
        // 既に存在する場合はエラー
        setError('本日は既に出勤しています')
        setIsLoading(false)
        return
      }

      // 新しい勤怠記録を作成
      const { error: insertError } = await supabase.from('attendances').insert({
        user_id: userProfile.id,
        date: dateStr,
        check_in_time: timeStr,
        status: 'working',
      })

      if (insertError) throw insertError

      setIsCheckedIn(true)
      setCheckedInTime(timeStr)
      setMessage(`✅ 出勤しました (${timeStr})`)
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error('Check-in failed:', err)
      setError(err instanceof Error ? err.message : '出勤に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!userProfile?.id) {
      setError('ユーザー情報が取得できません')
      return
    }

    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const now = new Date()
      const dateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Tokyo' })
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Tokyo',
      })

      // 勤怠記録を更新
      const { error: updateError } = await supabase
        .from('attendances')
        .update({ check_out_time: timeStr, status: 'approved' })
        .eq('user_id', userProfile.id)
        .eq('date', dateStr)

      if (updateError) throw updateError

      setIsCheckedIn(false)
      setMessage(`✅ 退勤しました (${timeStr})`)
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error('Check-out failed:', err)
      setError(err instanceof Error ? err.message : '退勤に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="page-title text-lg sm:text-2xl">打刻</h1>
        <p className="text-sm text-gray-600 mt-1">出勤・退勤の打刻を行います</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          ❌ {error}
        </div>
      )}

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>本日の勤務</CardTitle>
          <CardDescription>現在の時刻と出勤状況</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 時刻表示 */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">{currentDate}</p>
              <p className="text-5xl font-bold text-primary mb-4">{currentTime}</p>
            </div>

            {/* 状態表示 */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-2">勤務状態</p>
              <p className={`text-2xl font-bold ${isCheckedIn ? 'text-green-600' : 'text-gray-600'}`}>
                {isCheckedIn ? '出勤中' : '未出勤'}
              </p>
              {checkedInTime && (
                <p className="text-sm text-gray-500 mt-2">出勤時刻: {checkedInTime}</p>
              )}
            </div>

            {/* ボタン */}
            <div className="flex gap-3">
              <button
                onClick={handleCheckIn}
                disabled={isCheckedIn || isLoading}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition ${
                  isCheckedIn || isLoading
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isLoading ? '処理中...' : '出勤'}
              </button>
              <button
                onClick={handleCheckOut}
                disabled={!isCheckedIn || isLoading}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition ${
                  !isCheckedIn || isLoading
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isLoading ? '処理中...' : '退勤'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

CheckInOutPage.displayName = 'CheckInOutPage'
