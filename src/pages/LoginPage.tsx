import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // バリデーション
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
      navigate('/')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ログインに失敗しました'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        {/* ロゴ・ブランド */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⏱️</div>
          <h1 className="text-3xl font-bold text-gray-900">勤怠管理</h1>
          <p className="text-gray-600 mt-2">CLAUDE研修 Inc.</p>
        </div>

        {/* ログインフォーム */}
        <Card>
          <CardHeader>
            <CardTitle>ログイン</CardTitle>
            <CardDescription>
              メールアドレスとパスワードでログインしてください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* エラーメッセージ */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

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

              {/* パスワード */}
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

              {/* パスワード忘却リンク */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                >
                  パスワードを忘れた方
                </button>
              </div>

              {/* ログインボタン */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </Button>

              {/* サインアップリンク */}
              <div className="text-center text-sm text-gray-600">
                アカウントをお持ちでない方は
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="text-primary hover:underline ml-1"
                >
                  こちらから登録
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 利用可能なテスト認証情報 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
          <p className="font-medium mb-2">テスト用認証情報:</p>
          <p>メール: test@example.com</p>
          <p>パスワード: password123</p>
        </div>
      </div>
    </div>
  )
}

LoginPage.displayName = 'LoginPage'
