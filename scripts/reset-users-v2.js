#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wirkjfsgwikhenxejeah.supabase.co'
const SERVICE_ROLE_KEY = process.argv[2]

if (!SERVICE_ROLE_KEY) {
  console.error('❌ SERVICE_ROLE_KEY を引数で指定してください:')
  console.error('node scripts/reset-users-v2.js <SERVICE_ROLE_KEY>')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function resetUsers() {
  console.log('🔄 Supabase ユーザーリセット開始...\n')

  try {
    // 全ユーザーを取得
    console.log('📋 ユーザー一覧を取得中...')
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers()

    if (fetchError) {
      throw new Error(`ユーザー取得エラー: ${fetchError.message}`)
    }

    console.log(`✅ ${users.users.length} 件のユーザーが見つかりました\n`)

    // test@example.com 以外のユーザーを取得
    const usersToDelete = users.users.filter(
      (user) => user.email !== 'test@example.com'
    )

    if (usersToDelete.length === 0) {
      console.log('✅ 削除対象ユーザーなし（test@example.com のみ残存）')
      return
    }

    console.log(`🗑️  ${usersToDelete.length} 件のユーザーを削除します:\n`)
    usersToDelete.forEach((user) => {
      console.log(`  - ${user.email}`)
    })
    console.log()

    // ユーザーを1件ずつ削除
    for (const user of usersToDelete) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

      if (deleteError) {
        console.log(`❌ 削除失敗: ${user.email} - ${deleteError.message}`)
      } else {
        console.log(`✅ 削除完了: ${user.email}`)
      }
    }

    console.log('\n✨ ユーザーリセット完了！')
    console.log('📧 テストアカウント: test@example.com')
    console.log('🔐 パスワード: password123\n')
  } catch (error) {
    console.error('❌ エラーが発生しました:')
    console.error(error.message)
    process.exit(1)
  }
}

resetUsers()
