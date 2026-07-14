import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabase'
import { SetupRequiredPage } from './SetupRequiredPage'

// 管理者登録用のPIN（環境変数で上書き可能）
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '0000'

export const SignupPage: React.FC = () => {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
  })
  const [wantsAdmin, setWantsAdmin] = useState(false)
  const [adminPin, setAdminPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const isAdminVerified = wantsAdmin && adminPin === ADMIN_PIN

  const handleSelectEmployee = () => {
    setWantsAdmin(false)
    setAdminPin('')
    setFormData((prev) => ({ ...prev, role: 'employee' }))
  }

  const handleSelectAdmin = () => {
    // PIN が確認されるまでは管理者ロールを確定しない
    setWantsAdmin(true)
    setFormData((prev) => ({ ...prev, role: 'employee' }))
  }

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pin = e.target.value
    setAdminPin(pin)
    setFormData((prev) => ({ ...prev, role: pin === ADMIN_PIN ? 'admin' : 'employee' }))
  }

  if (!isSupabaseConfigured()) {
    return <SetupRequiredPage />
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('すべてのフィールドを入力してください')
        setIsLoading(false)
        return
      }

      if (!formData.email.includes('@')) {
        setError('有効なメールアドレスを入力してください')
        setIsLoading(false)
        return
      }

      if (formData.password.length < 6) {
        setError('パスワードは6文字以上である必要があります')
        setIsLoading(false)
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError('パスワードが一致しません')
        setIsLoading(false)
        return
      }

      // 管理者を選択している場合は PIN の確認が必須
      if (wantsAdmin && !isAdminVerified) {
        setError('管理者PINが正しくありません')
        setIsLoading(false)
        return
      }

      await signup(formData.email, formData.password, formData.name, formData.role)
      // 自動ログイン成功後は GuestRoute がダッシュボードへリダイレクトする
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登録に失敗しました'

      // アカウント作成は成功したが自動ログインに失敗した場合はログイン画面へ誘導
      if (errorMessage === 'SIGNUP_AUTOLOGIN_FAILED') {
        navigate('/login', {
          replace: true,
          state: { message: 'アカウントを作成しました。ログインしてください。' },
        })
        return
      }

      let displayError = errorMessage
      if (errorMessage.includes('rate limit')) {
        displayError = '登録回数が多すぎます。少し時間をおいてから再度お試しください。'
      } else if (errorMessage.includes('already registered')) {
        displayError = 'このメールアドレスは既に登録されています。'
      } else if (errorMessage.includes('invalid email')) {
        displayError = 'メールアドレスの形式が正しくありません。'
      }

      setError(displayError)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">勤怠管理</h1>
          <p className="text-gray-600 mt-2">CLAUDE研修 Inc.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>アカウント登録</CardTitle>
            <CardDescription>
              新しいアカウントを作成してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ロール選択
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="employee"
                      checked={!wantsAdmin}
                      onChange={handleSelectEmployee}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">従業員</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={wantsAdmin}
                      onChange={handleSelectAdmin}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">管理者</span>
                  </label>
                </div>

                {/* 管理者選択時はPINの確認が必要 */}
                {wantsAdmin && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      管理者PIN
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={adminPin}
                      onChange={handlePinChange}
                      placeholder="PINを入力"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {isAdminVerified ? (
                      <p className="text-xs text-green-700 font-medium">
                        PINを確認しました。管理者として登録されます
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">
                        管理者として登録するにはPINの入力が必要です
                      </p>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? '登録中...' : 'アカウント登録'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                既にアカウントをお持ちの方は
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-primary hover:underline ml-1"
                >
                  ログイン
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

SignupPage.displayName = 'SignupPage'
