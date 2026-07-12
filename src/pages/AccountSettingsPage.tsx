import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

export const AccountSettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [formData, setFormData] = useState({
    name: localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user') || '{}').name || ''
      : '',
    email: localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user') || '{}').email || ''
      : '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      if (!formData.name || !formData.email) {
        setError('名前とメールアドレスは必須です')
        setIsLoading(false)
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 800))

      const userData = {
        name: formData.name,
        email: formData.email,
      }
      localStorage.setItem('user', JSON.stringify(userData))
      setSuccessMessage('プロフィールが更新されました')

      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError('更新に失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        setError('すべてのパスワードフィールドを入力してください')
        setIsLoading(false)
        return
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('新しいパスワードが一致しません')
        setIsLoading(false)
        return
      }

      if (formData.newPassword.length < 6) {
        setError('パスワードは6文字以上である必要があります')
        setIsLoading(false)
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 800))

      setSuccessMessage('パスワードが変更されました')
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))

      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError('パスワード変更に失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      setError('ログアウトに失敗しました')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-lg sm:text-2xl">アカウント設定</h1>
        <p className="text-sm text-gray-600 mt-1">
          プロフィール情報とセキュリティ設定を管理できます
        </p>
      </div>

      {/* プロフィール情報 */}
      <Card>
        <CardHeader>
          <CardTitle>プロフィール情報</CardTitle>
          <CardDescription>
            名前とメールアドレスを更新できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-4">
              ✅ {successMessage}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            {/* 名前 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                名前
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="山田太郎"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@claude.jp"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? '更新中...' : 'プロフィールを更新'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* パスワード変更 */}
      <Card>
        <CardHeader>
          <CardTitle>パスワード変更</CardTitle>
          <CardDescription>
            セキュリティのため定期的にパスワードを変更することをお勧めします
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* 現在のパスワード */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                現在のパスワード
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* 新しいパスワード */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新しいパスワード
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* パスワード確認 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワード確認
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? '変更中...' : 'パスワードを変更'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ログアウト */}
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-900">ログアウト</CardTitle>
          <CardDescription className="text-red-700">
            このセッションをログアウトします
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            ログアウト
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

AccountSettingsPage.displayName = 'AccountSettingsPage'
