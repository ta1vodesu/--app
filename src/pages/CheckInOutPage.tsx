import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

export const CheckInOutPage: React.FC = () => {
  const { userProfile } = useAuth()
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [isCheckedOut, setIsCheckedOut] = useState(false)
  const [checkedInTime, setCheckedInTime] = useState<string | null>(null)
  const [checkedOutTime, setCheckedOutTime] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentDate, setCurrentDate] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

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

  useEffect(() => {
    const fetchTodayAttendance = async () => {
      if (!userProfile?.id) return

      try {
        const now = new Date()
        const dateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Tokyo' })

        const { data, error: fetchError } = await supabase
          .from('attendances')
          .select('*')
          .eq('user_id', userProfile.id)
          .eq('date', dateStr)
          .maybeSingle()

        if (fetchError) {
          console.error('[CheckInOutPage] 勤怠情報取得エラー:', fetchError)
          return
        }

        if (data) {
          const hasCheckedIn = !!data.check_in_time
          const hasCheckedOut = !!data.check_out_time

          setIsCheckedIn(hasCheckedIn)
          setIsCheckedOut(hasCheckedOut)

          if (data.check_in_time) {
            setCheckedInTime(data.check_in_time)
          }
          if (data.check_out_time) {
            setCheckedOutTime(data.check_out_time)
          }
        } else {
          setIsCheckedIn(false)
          setIsCheckedOut(false)
          setCheckedInTime(null)
          setCheckedOutTime(null)
        }
      } catch (err) {
        console.error('[CheckInOutPage] 勤怠情報取得例外:', err)
      }
    }

    fetchTodayAttendance()
  }, [userProfile?.id])

  const handleCheckIn = async () => {
    if (!userProfile?.id) {
      setError('ユーザー情報が取得できません')
      return
    }

    if (isCheckedIn) {
      setError('本日は既に出勤しています')
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

      const { data: existing } = await supabase
        .from('attendances')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('date', dateStr)
        .maybeSingle()

      if (existing) {
        setError('本日は既に出勤しています')
        setIsLoading(false)
        return
      }

      const { error: insertError } = await supabase
        .from('attendances')
        .insert({
          user_id: userProfile.id,
          date: dateStr,
          check_in_time: timeStr,
          status: 'working',
        })

      if (insertError) throw insertError

      setIsCheckedIn(true)
      setCheckedInTime(timeStr)
      setMessage(`出勤しました (${timeStr})`)
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error('[CheckInOutPage] 出勤失敗:', err)
      const errorMsg = err instanceof Error ? err.message : '出勤に失敗しました'
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!userProfile?.id) {
      setError('ユーザー情報が取得できません')
      return
    }

    if (isCheckedOut) {
      setError('本日は既に退勤しています')
      return
    }

    if (!isCheckedIn) {
      setError('先に出勤してください')
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

      const { error: updateError } = await supabase
        .from('attendances')
        .update({ check_out_time: timeStr, status: 'worked' })
        .eq('user_id', userProfile.id)
        .eq('date', dateStr)

      if (updateError) {
        console.error('[CheckInOutPage] 退勤更新エラー:', updateError)
        throw updateError
      }

      setIsCheckedOut(true)
      setCheckedOutTime(timeStr)
      setMessage(`退勤しました (${timeStr})`)
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error('[CheckInOutPage] 退勤失敗:', err)
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
{error}
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
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">{currentDate}</p>
              <p className="text-5xl font-bold text-primary mb-4">{currentTime}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-2">勤務状態</p>
              <p className={`text-2xl font-bold ${
                isCheckedOut ? 'text-orange-600' : isCheckedIn ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {isCheckedOut ? '退勤済み' : isCheckedIn ? '出勤中' : '未出勤'}
              </p>
              {checkedInTime && (
                <p className="text-sm text-gray-500 mt-2">出勤時刻: {checkedInTime}</p>
              )}
              {checkedOutTime && (
                <p className="text-sm text-gray-500 mt-1">退勤時刻: {checkedOutTime}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCheckIn}
                disabled={isCheckedIn || isCheckedOut || isLoading}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition ${
                  isCheckedIn || isCheckedOut || isLoading
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? '処理中...' : '出勤'}
              </button>
              <button
                onClick={handleCheckOut}
                disabled={!isCheckedIn || isCheckedOut || isLoading}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition ${
                  !isCheckedIn || isCheckedOut || isLoading
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
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
