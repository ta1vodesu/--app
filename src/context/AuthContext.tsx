import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

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

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('[AuthContext] プロフィール取得開始:', userId)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[AuthContext] ❌ プロフィール取得エラー:', error)
        return
      }

      console.log('[AuthContext] ✅ プロフィール取得成功:', data)
      setUserProfile(data as UserProfile)
    } catch (error) {
      console.error('[AuthContext] ❌ プロフィール取得エラー:', error)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[AuthContext] 認証状態チェック開始')
        const { data } = await supabase.auth.getSession()
        const authUser = data.session?.user ?? null
        setUser(authUser)

        if (authUser?.id) {
          console.log('[AuthContext] ✅ セッション有効:', authUser.email)
          await fetchUserProfile(authUser.id)
        } else {
          console.log('[AuthContext] ℹ️ セッションなし')
          setUserProfile(null)
        }
      } catch (error) {
        console.error('[AuthContext] ❌ 認証チェックエラー:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthContext] 認証状態変化イベント:', event)
      const authUser = session?.user ?? null
      setUser(authUser)

      if (authUser?.id) {
        console.log('[AuthContext] ✅ ユーザーログイン:', authUser.email)
        fetchUserProfile(authUser.id)
      } else {
        console.log('[AuthContext] 🚪 ユーザーログアウト')
        setUserProfile(null)
      }
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] ログイン開始:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw new Error(error.message)

      console.log('[AuthContext] ✅ ログイン成功')
      if (data.user?.id) {
        setUser(data.user)
        await fetchUserProfile(data.user.id)
      }
    } catch (error) {
      console.error('[AuthContext] ❌ ログインエラー:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      console.log('[AuthContext] ログアウト開始')
      const { error } = await supabase.auth.signOut()
      if (error) throw new Error(error.message)

      console.log('[AuthContext] ✅ ログアウト成功')
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      console.error('[AuthContext] ❌ ログアウトエラー:', error)
      setUser(null)
      setUserProfile(null)
      throw error
    }
  }

  const signup = async (email: string, password: string, name?: string) => {
    try {
      console.log('[AuthContext] サインアップ開始:', { email, name })
      
      // 1. Supabase 認証でユーザーを作成
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

      console.log('[AuthContext] ✅ 認証ユーザー作成成功:', authData.user.id)

      // 2. デフォルト部署を取得（最初の部署を使用）
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('id')
        .limit(1)
        .single()

      let departmentId: string | null = null
      if (deptData?.id) {
        departmentId = deptData.id
        console.log('[AuthContext] ✅ 部署を取得:', departmentId)
      } else if (deptError) {
        console.warn('[AuthContext] ⚠️ 部署取得エラー:', deptError)
      }

      // 3. ユーザープロフィールを users テーブルに保存
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email,
          name: name || email.split('@')[0],
          role: 'employee',
          department_id: departmentId,
          is_active: true,
        })

      if (profileError) {
        console.error('[AuthContext] ❌ プロフィール作成エラー:', profileError)
        throw new Error(`プロフィール作成エラー: ${profileError.message}`)
      }

      console.log('[AuthContext] ✅ プロフィール作成成功')

      // 4. 登録したユーザーで自動ログイン
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('[AuthContext] ⚠️ 自動ログインエラー:', signInError)
        return
      }

      if (signInData.user?.id) {
        console.log('[AuthContext] ✅ 自動ログイン成功')
        setUser(signInData.user)
        await fetchUserProfile(signInData.user.id)
      }

      console.log('[AuthContext] ✅ サインアップ完了:', { id: authData.user.id, name, email, departmentId })
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
