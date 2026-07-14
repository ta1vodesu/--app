import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { UserRole } from '@/types'

interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  department_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (email: string, password: string, name?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 重複リクエストを防ぐためのRef
  const profileFetchingRef = useRef<Set<string>>(new Set())
  const lastProfileFetchRef = useRef<Map<string, number>>(new Map())

  const fetchUserProfile = async (userId: string, forceRefresh = false) => {
    // 既に同じユーザーのプロフィール取得中の場合は、待機
    if (profileFetchingRef.current.has(userId) && !forceRefresh) {
      return null
    }

    // 前回の取得から1分以内の場合はスキップ（forceRefresh でない限り）
    const lastFetch = lastProfileFetchRef.current.get(userId) || 0
    const now = Date.now()
    if (!forceRefresh && now - lastFetch < 60000) {
      return null
    }

    profileFetchingRef.current.add(userId)
    lastProfileFetchRef.current.set(userId, now)

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, role, department_id, is_active, created_at, updated_at')
        .eq('id', userId)
        .single()

      // エラーが発生した場合もサイレントに続行（部署情報は必須ではない）
      if (error) {
        return null
      }

      if (!data) {
        return null
      }

      setUserProfile(data as UserProfile)
      return data as UserProfile
    } catch (error) {
      // 例外も無視してサイレント処理
      return null
    } finally {
      profileFetchingRef.current.delete(userId)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const authUser = data.session?.user ?? null
        setUser(authUser)

        if (authUser?.id) {
          await fetchUserProfile(authUser.id, true)
        } else {
          setUserProfile(null)
        }
      } catch (error) {
        console.error('[AuthContext] ❌ 認証チェックエラー:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null
      setUser(authUser)

      if (authUser?.id) {
        fetchUserProfile(authUser.id, true)
      } else {
        setUserProfile(null)
        profileFetchingRef.current.clear()
        lastProfileFetchRef.current.clear()
      }
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw new Error(error.message)

      if (data.user?.id) {
        setUser(data.user)
        await fetchUserProfile(data.user.id, true)
      }
    } catch (error) {
      console.error('[AuthContext] ❌ ログインエラー:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw new Error(error.message)

      setUser(null)
      setUserProfile(null)
      profileFetchingRef.current.clear()
      lastProfileFetchRef.current.clear()
    } catch (error) {
      console.error('[AuthContext] ❌ ログアウトエラー:', error)
      setUser(null)
      setUserProfile(null)
      throw error
    }
  }

  const signup = async (email: string, password: string, name?: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user?.id) {
        throw new Error('ユーザー作成に失敗しました')
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: email,
        name: name || email.split('@')[0],
        role: UserRole.EMPLOYEE,
        department_id: null,
        is_active: true,
      })

      if (profileError) {
        console.error('[AuthContext] ❌ プロフィール作成エラー:', profileError)
        throw new Error(`プロフィール作成エラー: ${profileError.message}`)
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('[AuthContext] ⚠️ 自動ログインエラー:', signInError)
        return
      }

      if (signInData.user?.id) {
        setUser(signInData.user)
        await fetchUserProfile(signInData.user.id, true)
      }
    } catch (error) {
      console.error('[AuthContext] ❌ サインアップエラー:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    userProfile,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
