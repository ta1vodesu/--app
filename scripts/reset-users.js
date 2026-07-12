#!/usr/bin/env node

import https from 'https';
import { URL } from 'url';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ 環境変数が設定されていません:');
  console.error('SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください');
  process.exit(1);
}

async function getUsers() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/auth/v1/admin/users`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data).users || []);
        } else {
          reject(new Error(`Failed to fetch users: ${res.statusCode}`));
        }
      });
    }).on('error', reject).end();
  });
}

async function deleteUser(userId) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode === 204 || res.statusCode === 200) {
          resolve(true);
        } else {
          reject(new Error(`Failed to delete user: ${res.statusCode}`));
        }
      });
    }).on('error', reject).end();
  });
}

async function resetUsers() {
  console.log('🔄 Supabase ユーザーリセット開始...\n');

  try {
    console.log('📋 ユーザー一覧を取得中...');
    const users = await getUsers();
    console.log(`✅ ${users.length} 件のユーザーが見つかりました\n`);

    const usersToDelete = users.filter(
      (user) => user.email !== 'test@example.com',
    );

    if (usersToDelete.length === 0) {
      console.log('✅ 削除対象ユーザーなし（test@example.com のみ残存）');
      return;
    }

    console.log(`🗑️  ${usersToDelete.length} 件のユーザーを削除します:\n`);
    usersToDelete.forEach((user) => {
      console.log(`  - ${user.email}`);
    });
    console.log();

    for (const user of usersToDelete) {
      await deleteUser(user.id);
      console.log(`✅ 削除完了: ${user.email}`);
    }

    console.log('\n✨ ユーザーリセット完了！');
    console.log('📧 テストアカウント: test@example.com');
    console.log('🔐 パスワード: password123\n');
  } catch (error) {
    console.error('❌ エラーが発生しました:');
    console.error(error.message);
    process.exit(1);
  }
}

resetUsers();
