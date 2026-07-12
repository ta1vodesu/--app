# 🚀 Supabase 完全セットアップガイド

勤怠管理アプリケーションを Supabase で動作させるための完全なセットアップ手順です。

---

## 📋 セットアップ前チェック

以下のものを用意してください：
- ✅ Supabase アカウント
- ✅ プロジェクト URL
- ✅ Anon Public Key
- ✅ ブラウザ（Chrome/Firefox）

---

## 🔧 STEP 1: 環境変数の設定（5分）

### 1️⃣ `.env.local` ファイルを作成
プロジェクトルートに `.env.local` を作成：

```bash
# .env.local
VITE_SUPABASE_URL=https://wirkjfsgwikhenxejeah.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_WI7U9SVKzVMR27GeQ_slkg_JP-hAA4e
```

### 2️⃣ 値を確認
```bash
# ターミナルで確認
cat .env.local
```

**✅ 確認項目**:
- `VITE_SUPABASE_URL` が `https://` で始まるか
- `VITE_SUPABASE_ANON_KEY` が `sb_` で始まるか
- 値の間にスペースがないか

### 3️⃣ サーバーをリロード
```bash
# ターミナルで Ctrl+C を押してサーバーを停止
# その後再起動
npm run dev
```

---

## 🗄️ STEP 2: データベーステーブル作成（10分）

### 1️⃣ Supabase ダッシュボードを開く
```
https://supabase.com/dashboard/project/wirkjfsgwikhenxejeah/sql/new
```

### 2️⃣ SQL エディタを開く
- 左サイドバー → **SQL Editor** をクリック
- **+ New Query** をクリック

### 3️⃣ テーブル作成 SQL を実行

以下のいずれかの方法でテーブルを作成：

**方法 A: 簡易版（最小限のテーブル）**

```sql
-- users テーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'employee',
  department_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- departments テーブル
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  manager_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- attendances テーブル
CREATE TABLE IF NOT EXISTS attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  working_hours VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_attendances_user_id ON attendances(user_id);
CREATE INDEX IF NOT EXISTS idx_attendances_date ON attendances(date);
```

**✅ 実行手順**:
1. 上記の SQL をすべてコピー
2. Supabase SQL エディタにペースト
3. **RUN** ボタンをクリック
4. 画面上に "Query executed" が表示されたら成功

---

## 🔐 STEP 3: 認証設定（5分）

### 1️⃣ Authentication 設定を開く
Supabase ダッシュボード → **Authentication** → **Providers**

### 2️⃣ Email 認証の設定確認

| 項目 | 設定値 |
|------|--------|
| Email | ✅ **有効** |
| Confirm email | ✅ **Disabled** (テスト用) |
| Require email verification | ✅ **OFF** |

### 3️⃣ Site URL 設定

1. **Authentication** → **URL Configuration** をクリック
2. **Site URL** に以下を設定：
   ```
   http://localhost:5173
   ```
3. **Save** をクリック

---

## 🛡️ STEP 4: Row Level Security (RLS) 設定（10分）

### 1️⃣ SQL エディタで RLS を有効化

```sql
-- RLS を有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;

-- users テーブルのポリシー
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text OR EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- attendances テーブルのポリシー
CREATE POLICY "Users can view own attendance"
  ON attendances FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create own attendance"
  ON attendances FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

-- departments テーブルのポリシー（全員閲覧可能）
CREATE POLICY "Everyone can view departments"
  ON departments FOR SELECT
  USING (true);
```

**✅ 実行**:
1. 上記の SQL をコピー
2. Supabase SQL エディタにペースト
3. **RUN** をクリック

---

## ✅ STEP 5: テスト（5分）

### 1️⃣ Supabase でユーザーを確認

```bash
# Supabase SQL エディタで実行
SELECT * FROM users;
```

### 2️⃣ ブラウザでテスト

1. `http://localhost:5174` にアクセス
2. **ログイン** ページが表示される
3. **アカウント登録** をクリック

### 3️⃣ テストアカウントを作成

```
メールアドレス: test@example.com
パスワード: TestPassword123
パスワード確認: TestPassword123
```

### 4️⃣ エラーが出たら確認

**コンソールでエラーを確認**:
1. F12 キーで Developer Tools を開く
2. **Console** タブをクリック
3. エラーメッセージを記録

---

## 🧪 STEP 6: 動作確認（5分）

### ✅ 成功の目安

| 項目 | チェック |
|------|---------|
| サインアップできた | ✅ |
| ダッシュボードが表示された | ✅ |
| ログアウトできた | ✅ |
| 再度ログインできた | ✅ |
| データが表示された | ✅ |

---

## ❌ トラブルシューティング

### **"Error: invalid API key"**

```
原因: .env.local の設定が間違っている
対応:
1. .env.local を再度確認
2. Supabase ダッシュボード → Settings → API で再度コピー
3. npm run dev を再実行
```

### **"relation 'users' does not exist"**

```
原因: テーブルが作成されていない
対応:
1. Supabase SQL エディタで SELECT * FROM users; を実行
2. エラーが出たら、STEP 2 のテーブル作成 SQL を再度実行
```

### **"Email not confirmed"**

```
原因: メール確認設定が有効化されている
対応:
1. Authentication → Providers → Email
2. "Confirm email" を Disabled に変更
3. Save をクリック
```

### **"Permission denied"**

```
原因: RLS ポリシーが正しく設定されていない
対応:
1. Supabase SQL エディタで STEP 4 のポリシー SQL を再度実行
2. RLS が有効になっているか確認
```

---

## 📞 サポートコマンド

### コンソールでテスト（手動テスト）

```typescript
// ブラウザコンソール(F12 → Console)で実行

// 1. Supabase クライアント確認
import { supabase } from '@/lib/supabase'
console.log(supabase)

// 2. セッション確認
const { data } = await supabase.auth.getSession()
console.log(data)

// 3. ユーザー作成テスト
const { data: auth, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'TestPassword123'
})
console.log(auth, error)
```

---

## 🎯 セットアップ完了チェックリスト

- [ ] `.env.local` が作成されている
- [ ] `VITE_SUPABASE_URL` が設定されている
- [ ] `VITE_SUPABASE_ANON_KEY` が設定されている
- [ ] テーブルが作成されている（users, departments, attendances）
- [ ] RLS が有効化されている
- [ ] RLS ポリシーが作成されている
- [ ] Email 認証が有効化されている
- [ ] Confirm email が disabled になっている
- [ ] Site URL が設定されている
- [ ] サインアップができた
- [ ] ログインができた
- [ ] ダッシュボードが表示された

---

## 📚 参考リソース

- [Supabase 公式ドキュメント](https://supabase.com/docs)
- [Authentication ガイド](https://supabase.com/docs/guides/auth)
- [RLS ガイド](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL エディタガイド](https://supabase.com/docs/guides/database/sql-editor)

---

**ここまでセットアップできたら、アプリケーションは完全に動作します！** 🎉
