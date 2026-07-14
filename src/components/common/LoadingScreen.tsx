import React from 'react'

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      {/* テキスト */}
      <h1 className="text-2xl font-bold text-gray-900 mb-2">勤怠管理</h1>
      <p className="text-gray-600 mb-8">ログイン認証中...</p>

      {/* ローディングインジケーター */}
      <div className="flex gap-2" role="status" aria-label="読み込み中">
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  )
}

LoadingScreen.displayName = 'LoadingScreen'
