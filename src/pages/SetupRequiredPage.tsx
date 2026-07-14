import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const SetupRequiredPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3"></div>
          <h1 className="text-3xl font-bold text-gray-900">セットアップが必要です</h1>
          <p className="text-gray-600 mt-2">Supabase の認証情報を設定してください</p>
        </div>

        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">Supabase 設定手順</CardTitle>
            <CardDescription className="text-yellow-800">
              以下の手順で Supabase を設定してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ステップ1 */}
            <div className="space-y-2">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Supabase プロジェクトを作成</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      supabase.com
                    </a>
                    にアクセスして、新規プロジェクトを作成します
                  </p>
                </div>
              </div>
            </div>

            {/* ステップ2 */}
            <div className="space-y-2">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">API 認証情報を取得</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    プロジェクト設定 → API から以下を取得します：
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4">
                    <li>📌 Project URL（VITE_SUPABASE_URL）</li>
                    <li>📌 Anon/Public Key（VITE_SUPABASE_ANON_KEY）</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ステップ3 */}
            <div className="space-y-2">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">.env.local ファイルを作成</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    プロジェクトルートに <code className="bg-white px-2 py-1 rounded">.env.local</code> を作成し、以下を追記します：
                  </p>
                  <div className="bg-white p-3 rounded mt-2 text-xs font-mono text-gray-800 overflow-x-auto">
                    <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
                    <div>VITE_SUPABASE_ANON_KEY=your-anon-key</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ステップ4 */}
            <div className="space-y-2">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">開発サーバーを再起動</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    ターミナルで <code className="bg-white px-2 py-1 rounded">npm run dev</code> を実行します
                  </p>
                </div>
              </div>
            </div>

            {/* 注意 */}
            <div className="bg-red-50 border border-red-200 rounded p-4 mt-6">
              <p className="text-sm text-red-700 font-medium">重要な注意</p>
              <ul className="text-sm text-red-600 mt-2 space-y-1 ml-4">
                <li>• .env.local ファイルは Git にコミットしないでください</li>
                <li>• API キーは秘密情報です。絶対に他人と共有しないでください</li>
                <li>• 環境変数の変更後は、開発サーバーの再起動が必須です</li>
              </ul>
            </div>

            {/* ボタン */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => window.open('https://supabase.com', '_blank')}
                className="flex-1"
              >
                Supabase にアクセス
              </Button>
              <Button
                onClick={() => location.reload()}
                variant="outline"
                className="flex-1"
              >
                設定後にリロード
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 参考リンク */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
          <p className="font-medium mb-2">📖 参考資料</p>
          <ul className="space-y-1">
            <li>
              • <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase ドキュメント</a>
            </li>
            <li>
              • <a href="https://supabase.com/docs/guides/auth" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Auth ガイド</a>
            </li>
            <li>
              • <a href="/SETUP_GUIDE.md" className="text-blue-600 hover:underline">ローカル セットアップガイド</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

SetupRequiredPage.displayName = 'SetupRequiredPage'
