import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Location } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabase'
import { SetupRequiredPage } from './SetupRequiredPage'

interface LocationState {
  from?: Location
  message?: string
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [redirectPending, setRedirectPending] = useState(false)

  // Supabase が設定されていない場合はセットアップページを表示
  if (!isSupabaseConfigured()) {
    return <SetupRequiredPage />
  }

  useEffect(() => {
    // SignupPage からのメッセージを取得
    const state = location.state as LocationState | null
    if (state?.message) {
      setSuccessMessage(state.message)
      const timer = setTimeout(() => setSuccessMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [location.state])

  // ログイン後のリダイレクト（レース条件対策）
  useEffect(() => {
    if (redirectPending && isAuthenticated) {
      const state = location.state as LocationState | null
      const from = state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [redirectPending, isAuthenticated, navigate, location.state])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!formData.email || !formData.password) {
      setError('メールアドレスとパスワードを入力してください')
      setIsLoading(false)
      return
    }

    if (!formData.email.includes('@')) {
      setError('有効なメールアドレスを入力してください')
      setIsLoading(false)
      return
    }

    try {
      await login(formData.email, formData.password)
      setRedirectPending(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ログインに失敗しました'
      console.error('Login error:', err)
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⏱️</div>
          <h1 className="text-3xl font-bold text-gray-900">勤怠管理</h1>
          <p className="text-gray-600 mt-2">CLAUDE研修 Inc.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ログイン</CardTitle>
            <CardDescription>
              メールアドレスとパスワードでログインしてください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                  ✅ {successMessage}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  ❌ {error}
                </div>
              )}

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

              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                >
                  パスワードを忘れた方
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </Button>

              <div className="pt-2 space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">または</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/signup')}
                  className="w-full"
                >
                  新しいアカウントを作成
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
          <p className="font-medium mb-2">テスト用認証情報:</p>
          <p>メール: test@example.com</p>
          <p>パスワード: password123</p>
          <p className="text-xs text-gray-500 mt-2">※ Supabase が設定されている場合のみ使用可能</p>
        </div>
      </div>
    </div>
  )
}

LoginPage.displayName = 'LoginPage'
