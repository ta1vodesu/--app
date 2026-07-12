import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { mockCurrentUser } from '@/data/mockData'

export const AccountSettingsPage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: mockCurrentUser.name,
    email: mockCurrentUser.email,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setIsEditing(false)
    // 実装: API に保存
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="page-title text-lg sm:text-2xl">アカウント設定</h1>
        <p className="text-sm text-gray-600 mt-1">
          プロフィール情報とアカウント設定を管理します
        </p>
      </div>

      {/* プロフィール */}
      <Card>
        <CardHeader>
          <CardTitle>プロフィール</CardTitle>
          <CardDescription>
            アカウント情報の確認・編集
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* アバターとユーザー情報 */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 bg-primary-foreground">
                <AvatarFallback className="bg-primary-foreground text-primary font-bold text-lg">
                  {mockCurrentUser.initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-lg font-semibold">{mockCurrentUser.name}</p>
                <p className="text-sm text-gray-600">{mockCurrentUser.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="default">
                    {mockCurrentUser.role === 'manager'
                      ? 'マネージャー'
                      : mockCurrentUser.role === 'admin'
                      ? '管理者'
                      : '従業員'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 編集フォーム */}
            {isEditing ? (
              <div className="space-y-4 border-t pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    名前
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    保存
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-t pt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  編集する
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* セキュリティ設定 */}
      <Card>
        <CardHeader>
          <CardTitle>セキュリティ</CardTitle>
          <CardDescription>
            パスワードとセキュリティ設定
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">パスワード</p>
              <p className="text-sm text-gray-600">定期的に変更することをお勧めします</p>
            </div>
            <Button variant="outline" size="sm">
              変更する
            </Button>
          </div>
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">2段階認証</p>
              <p className="text-sm text-gray-600">アカウントのセキュリティを強化</p>
            </div>
            <Badge variant="secondary">未設定</Badge>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">ログイン履歴</p>
              <p className="text-sm text-gray-600">最近のログイン情報を確認</p>
            </div>
            <Button variant="outline" size="sm">
              確認する
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 通知設定 */}
      <Card>
        <CardHeader>
          <CardTitle>通知設定</CardTitle>
          <CardDescription>
            メール通知の設定
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm">申請承認完了メール</span>
          </label>
          <label className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm">勤務時間レポート</span>
          </label>
          <label className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm">給与明細通知</span>
          </label>
        </CardContent>
      </Card>

      {/* ログアウト */}
      <Card>
        <CardHeader>
          <CardTitle>セッション</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="text-gray-700 hover:text-gray-900">
            ログアウト
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

AccountSettingsPage.displayName = 'AccountSettingsPage'
