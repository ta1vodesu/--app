import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type WorkType = 'normal' | 'remote' | 'business-trip' | null

interface BreakTime {
  startTime: string
  endTime: string | null
}

export const CheckInOutPage: React.FC = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [checkedInTime, setCheckedInTime] = useState<string | null>(null)
  const [checkedOutTime, setCheckedOutTime] = useState<string | null>(null)
  const [workType, setWorkType] = useState<WorkType>(null)
  const [breakTimes, setBreakTimes] = useState<BreakTime[]>([])
  const [workingHours, setWorkingHours] = useState<string | null>(null)
  const [totalBreakTime, setTotalBreakTime] = useState<string>('0h0m')
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentDate, setCurrentDate] = useState<string>('')
  const [showWorkTypeModal, setShowWorkTypeModal] = useState(false)

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

  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const calculateTimeData = () => {
    if (!checkedInTime || !checkedOutTime) return

    const [inH, inM, inS] = checkedInTime.split(':').map(Number)
    const [outH, outM, outS] = checkedOutTime.split(':').map(Number)

    let totalMinutes = outH * 60 + outM - (inH * 60 + inM)

    let breakMinutes = 0
    breakTimes.forEach((breakTime) => {
      if (breakTime.endTime) {
        const [bStartH, bStartM] = breakTime.startTime.split(':').map(Number)
        const [bEndH, bEndM] = breakTime.endTime.split(':').map(Number)
        breakMinutes += bEndH * 60 + bEndM - (bStartH * 60 + bStartM)
      }
    })

    const workMinutes = totalMinutes - breakMinutes
    const hours = Math.floor(workMinutes / 60)
    const mins = workMinutes % 60
    setWorkingHours(`${hours}h${mins}m`)

    const breakHours = Math.floor(breakMinutes / 60)
    const breakMins = breakMinutes % 60
    setTotalBreakTime(`${breakHours}h${breakMins}m`)
  }

  useEffect(() => {
    calculateTimeData()
  }, [breakTimes, checkedInTime, checkedOutTime])

  const handleCheckIn = (type: WorkType) => {
    const time = getCurrentTime()
    setCheckedInTime(time)
    setIsCheckedIn(true)
    setWorkType(type)
    setShowWorkTypeModal(false)
  }

  const handleBreakStart = () => {
    if (!isCheckedIn || isOnBreak) return
    const time = getCurrentTime()
    setBreakTimes([...breakTimes, { startTime: time, endTime: null }])
    setIsOnBreak(true)
  }

  const handleBreakEnd = () => {
    if (!isOnBreak) return
    const time = getCurrentTime()
    const updatedBreaks = breakTimes.map((breakTime, index) =>
      index === breakTimes.length - 1
        ? { ...breakTime, endTime: time }
        : breakTime
    )
    setBreakTimes(updatedBreaks)
    setIsOnBreak(false)
  }

  const handleCheckOut = () => {
    if (isOnBreak) {
      handleBreakEnd()
    }
    const time = getCurrentTime()
    setCheckedOutTime(time)
    setIsCheckedIn(false)
  }

  const getWorkTypeLabel = () => {
    switch (workType) {
      case 'normal':
        return '通常勤務'
      case 'remote':
        return 'リモート勤務'
      case 'business-trip':
        return '出張'
      default:
        return '未選択'
    }
  }

  const workTypeOptions = [
    { value: 'normal' as WorkType, label: '通常勤務', description: 'オフィス勤務' },
    { value: 'remote' as WorkType, label: 'リモート勤務', description: '自宅やカフェ等' },
    { value: 'business-trip' as WorkType, label: '出張', description: '外出・営業活動' },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* リアルタイム時刻表示 */}
      <Card className="border-2 border-primary bg-gradient-to-br from-blue-50 to-blue-100">
        <CardContent className="pt-6 text-center">
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              現在時刻 (JST)
            </p>
            <p className="text-4xl sm:text-6xl font-bold text-primary font-mono">
              {currentTime}
            </p>
            <p className="text-sm sm:text-base text-gray-700 font-medium">
              {currentDate}
            </p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h1 className="page-title text-lg sm:text-2xl">打刻</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 今日の勤務状況 */}
        <Card>
          <CardHeader>
            <CardTitle>今日の勤務</CardTitle>
            <CardDescription>本日の勤務状況</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">勤務形態</p>
                <p className="text-lg font-bold text-primary">
                  {getWorkTypeLabel()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">出勤時刻</p>
                <p className="text-2xl font-bold text-primary">
                  {checkedInTime || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">退勤時刻</p>
                <p className="text-2xl font-bold text-gray-900">
                  {checkedOutTime || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">休憩時間</p>
                <p className="text-xl font-bold text-blue-600">
                  {totalBreakTime}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">勤務時間</p>
                <p className="text-2xl font-bold text-orange-600">
                  {workingHours || '—'}
                </p>
              </div>
            </div>

            {isCheckedIn && (
              <Badge variant="working" className="w-full justify-center py-2">
                {isOnBreak ? '休憩中' : '出勤中'}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* 打刻ボタン */}
        <Card>
          <CardHeader>
            <CardTitle>打刻</CardTitle>
            <CardDescription>出退勤を打刻してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!checkedInTime ? (
              <>
                <p className="text-center text-sm font-medium text-gray-700 mb-3">
                  勤務形態を選択して出勤してください
                </p>
                {showWorkTypeModal ? (
                  <div className="space-y-2">
                    {workTypeOptions.map((option) => (
                      <Button
                        key={option.value}
                        onClick={() => handleCheckIn(option.value)}
                        className="w-full h-auto py-3 text-left justify-start"
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-bold">{option.label}</span>
                          <span className="text-xs opacity-90">{option.description}</span>
                        </div>
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => setShowWorkTypeModal(false)}
                      className="w-full"
                    >
                      キャンセル
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowWorkTypeModal(true)}
                    className="w-full h-16 text-lg font-bold"
                  >
                    出勤打刻
                  </Button>
                )}
              </>
            ) : !checkedOutTime ? (
              <>
                <p className="text-center text-sm font-medium text-gray-700">
                  {checkedInTime} に出勤しました
                </p>
                <div className="space-y-2">
                  {isOnBreak ? (
                    <>
                      <Badge className="w-full justify-center py-2 bg-orange-500">
                        休憩中
                      </Badge>
                      <Button
                        onClick={handleBreakEnd}
                        className="w-full h-12 text-base font-bold bg-orange-500 hover:bg-orange-600"
                      >
                        休憩終了
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleBreakStart}
                      variant="outline"
                      className="w-full h-12 text-base font-bold"
                    >
                      休憩開始
                    </Button>
                  )}
                  <Button
                    onClick={handleCheckOut}
                    variant="destructive"
                    className="w-full h-12 text-base font-bold"
                  >
                    退勤打刻
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-center text-sm font-medium text-gray-700">
                  本日の勤務は終了しました
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCheckedIn(false)
                    setIsOnBreak(false)
                    setCheckedInTime(null)
                    setCheckedOutTime(null)
                    setWorkType(null)
                    setBreakTimes([])
                    setWorkingHours(null)
                    setTotalBreakTime('0h0m')
                  }}
                  className="w-full"
                >
                  リセット
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 休憩時間記録 */}
      {breakTimes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>休憩時間記録</CardTitle>
            <CardDescription>本日の休憩時間一覧</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {breakTimes.map((breakTime, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <span className="font-medium">休憩 {index + 1}</span>
                  <span className="text-sm">
                    {breakTime.startTime} - {breakTime.endTime || '進行中'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 注意事項 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            💡 <strong>打刻について:</strong> 毎日の打刻データは勤務記録として保存されます。外出時や休憩時は必ず打刻してください。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

CheckInOutPage.displayName = 'CheckInOutPage'
