import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { LoadingScreen } from '@/components/common/LoadingScreen'

interface GuestRouteProps {
  children: React.ReactNode
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (isAuthenticated) {
    // ProtectedRoute が保存した「元のページ」があればそこへ戻す
    const state = location.state as { from?: { pathname?: string } } | null
    return <Navigate to={state?.from?.pathname || '/'} replace />
  }

  return <>{children}</>
}

GuestRoute.displayName = 'GuestRoute'
