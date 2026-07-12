import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600">ページが見つかりません</p>
        <Link to="/">
          <Button>ダッシュボードに戻る</Button>
        </Link>
      </div>
    </div>
  )
}

NotFoundPage.displayName = 'NotFoundPage'
