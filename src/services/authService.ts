import { supabase } from '@/lib/supabase'

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  async signup(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  async logout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      throw new Error(error.message)
    }

    return data.user
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw new Error(error.message)
    }

    return data.session
  },
}
