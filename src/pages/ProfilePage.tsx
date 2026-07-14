import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/context/AuthContext'

interface ProfileData {
  name: string
  email: string
  department: string
  position: string
  joinDate: string
  phone: string
}

export const ProfilePage: React.FC = () => {
  const { userProfile, isLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    department: '',
    position: '',
    joinDate: '',
    phone: '',
  })
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        department: '営業部',
        position: 'マネージャー',
        joinDate: userProfile.created_at
          ? new Date(userProfile.created_at).toISOString().split('T')[0]
          : '',
        phone: '未設定',
      })
      setIsLoadingData(false)
    }
  }, [userProfile])

  const [formData, setFormData] = useState<ProfileData>(profileData)
  const [saved, setSaved] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setProfileData(formData)
    setIsEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleCancel = () => {
    setFormData(profileData)
    setIsEditing(false)
  }

  const userInitials = profileData.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  if (isLoading || isLoadingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">プロフィールを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="page-title text-lg sm:text-2xl">プロフィール</h1>
          <p className="text-sm text-gray-600 mt-1">
            プロフィール情報を表示・編集します
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          ユーザー情報を読み込めませんでした。ログインし直してください。
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="page-title text-lg sm:text-2xl">プロフィール</h1>
        <p className="text-sm text-gray-600 mt-1">
          プロフィール情報を表示・編集します
        </p>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">
プロフィールが保存されました。
          </p>
        </div>
      )}

      {/* プロフィールヘッダー */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* アバター */}
            <div className="flex flex-col items-center">
              <Avatar className="w-24 h-24 text-lg font-bold">
                <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
              </Avatar>
              <Badge className="mt-3">{profileData.position}</Badge>
            </div>

            {/* 基本情報 */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
              <p className="text-gray-600 text-sm mt-1">{profileData.email}</p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 text-sm text-gray-700">
                <div>
                  <p className="text-gray-500 text-xs">部署</p>
                  <p className="font-medium">{profileData.department}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">入社日</p>
                  <p className="font-medium">
                    {new Date(profileData.joinDate).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
            </div>

            {/* 編集ボタン */}
            <div className="w-full sm:w-auto">
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full sm:w-auto">
                  編集
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 編集フォーム */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>プロフィール編集</CardTitle>
            <CardDescription>
              プロフィール情報を編集してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              {/* 名前 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  名前 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* 電話番号 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電話番号
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* 部署（読み取り専用） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  部署
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">部署は管理者に連絡してください</p>
              </div>

              {/* 職位（読み取り専用） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  職位
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">職位は管理者に連絡してください</p>
              </div>

              {/* 入社日（読み取り専用） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  入社日
                </label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* ボタン */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  保存
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 詳細情報 */}
      {!isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>詳細情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">名前</p>
                <p className="text-gray-900 font-medium mt-1">{profileData.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">メールアドレス</p>
                <p className="text-gray-900 font-medium mt-1">{profileData.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">電話番号</p>
                <p className="text-gray-900 font-medium mt-1">{profileData.phone}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">部署</p>
                <p className="text-gray-900 font-medium mt-1">{profileData.department}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">職位</p>
                <p className="text-gray-900 font-medium mt-1">{profileData.position}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">入社日</p>
                <p className="text-gray-900 font-medium mt-1">
                  {new Date(profileData.joinDate).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

ProfilePage.displayName = 'ProfilePage'
