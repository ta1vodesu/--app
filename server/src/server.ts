import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Supabase クライアント（Service Role）
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 環境変数が設定されていません')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// サインアップエンドポイント
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password, and name are required',
      })
    }

    // 1. Supabase Auth でユーザーを作成
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      return res.status(400).json({ error: authError.message })
    }

    // 2. users テーブルにレコードを挿入
    if (authData.user?.id) {
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          role: 'employee',
          is_active: true,
        })

      if (insertError) {
        console.error('User profile creation error:', insertError)
        return res.status(400).json({ error: insertError.message })
      }
    }

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: authData.user?.id,
        email,
        name,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})
