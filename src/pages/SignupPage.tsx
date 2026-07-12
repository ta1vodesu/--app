import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

export const SignupPage: React.FC = () => {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

      await signup(formData.email, formData.password)
      navigate('/')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登録に失敗しました'
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

        {/* サインアップフォーム */}
        <Card>
          <CardHeader>
            <CardTitle>アカウント登録</CardTitle>
            <CardDescription>
              新しいアカウントを作成してください
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

              {/* 登録ボタン */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? '登録中...' : 'アカウント登録'}
              </Button>

              {/* ログインリンク */}
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
