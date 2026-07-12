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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Failed to fetch user profile:', error)
        return
      }

      setUserProfile(data as UserProfile)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const authUser = data.session?.user ?? null
        setUser(authUser)

        if (authUser?.id) {
          await fetchUserProfile(authUser.id)
        } else {
          setUserProfile(null)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      const authUser = session?.user ?? null
      setUser(authUser)

      if (authUser?.id) {
        fetchUserProfile(authUser.id)
      } else {
        setUserProfile(null)
      }
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw new Error(error.message)

    if (data.user?.id) {
      await fetchUserProfile(data.user.id)
    }
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  }

  const signup = async (email: string, password: string, name?: string) => {
    try {
      // 1. Supabase 認証でユーザーを作成
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        throw new Error(authError.message)
      }

      // 2. ユーザープロフィールを users テーブルに保存
      if (authData.user?.id) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: email,
            name: name || email.split('@')[0],
            role: 'employee',
            is_active: true,
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // プロフィール作成に失敗しても認証は成功しているので、エラーを投げない
        }
      }
    } catch (error) {
      console.error('Signup error:', error)
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
