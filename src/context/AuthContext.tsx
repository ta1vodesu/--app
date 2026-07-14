import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
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
      // maybeSingle: プロフィール未作成でも 406 エラーにならないようにする
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, role, department_id, is_active, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle()

      if (error || !data) {
        return null
      }

      setUserProfile(data as UserProfile)
      return data as UserProfile
    } catch {
      return null
    } finally {
      profileFetchingRef.current.delete(userId)
    }
  }

  useEffect(() => {
    // Supabase 未設定時はプレースホルダーへ通信しない
    if (!isSupabaseConfigured()) {
      setIsLoading(false)
      return
    }

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
      } catch {
        // 認証チェック失敗時は未ログイン扱いにする
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null
      setUser(authUser)

      if (authUser?.id) {
        // checkAuth / login 側の取得と重複しないよう、TTL・実行中ガードを尊重する
        fetchUserProfile(authUser.id)
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw new Error(error.message)

    if (data.user?.id) {
      setUser(data.user)
      await fetchUserProfile(data.user.id, true)
    }
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()

    // 通信に失敗してもローカルの認証状態は必ずクリアする
    setUser(null)
    setUserProfile(null)
    profileFetchingRef.current.clear()
    lastProfileFetchRef.current.clear()

    if (error) throw new Error(error.message)
  }

  const signup = async (email: string, password: string, name?: string) => {
    // 1) 認証ユーザーを作成。既存アカウントなら同じ認証情報でログインを試みて救済する
    //    （過去にプロフィール作成まで到達せず失敗したアカウント対策）
    let userId: string | null = null

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      const message = authError.message.toLowerCase()
      if (message.includes('already registered') || message.includes('already exists')) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError || !signInData.user) {
          throw new Error('このメールアドレスは既に登録されています')
        }
        userId = signInData.user.id
      } else {
        throw new Error(authError.message)
      }
    } else {
      userId = authData.user?.id ?? null
    }

    if (!userId) {
      throw new Error('ユーザー作成に失敗しました')
    }

    // 2) セッションを確保（signUp がセッションを返さない設定でも動くように）
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        // アカウント作成は成功しているため、呼び出し側でログイン画面へ誘導する
        throw new Error('SIGNUP_AUTOLOGIN_FAILED')
      }
    }

    // 3) プロフィールが無い場合のみ作成する
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (!existingProfile) {
      // DB 側の role CHECK 制約の差異に耐えるため、許可される値まで順に試す
      const roleCandidates = ['employee', UserRole.MEMBER]
      let profileError: { code?: string } | null = null

      for (const role of roleCandidates) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: userId,
          email,
          name: name || email.split('@')[0],
          role,
          department_id: null,
          is_active: true,
        })

        if (!insertError) {
          profileError = null
          break
        }

        profileError = insertError
        // CHECK 制約違反（23514）のときだけ次の候補を試す
        if (insertError.code !== '23514') break
      }

      // 並行作成による重複（23505）は成功として扱う
      if (profileError && profileError.code !== '23505') {
        throw new Error('プロフィールの作成に失敗しました。もう一度お試しください。')
      }
    }

    // 4) 認証状態を反映
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user) {
      setUser(userData.user)
      await fetchUserProfile(userData.user.id, true)
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
