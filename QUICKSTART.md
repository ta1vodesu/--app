# 🚀 勤怠管理アプリ - クイックスタートガイド

**5分でセットアップできる！**

---

## 📦 前提条件

- Node.js 18+ がインストールされている
- Supabase アカウント（https://supabase.com）
- ブラウザ

---

## ⚡ 3ステップセットアップ

### STEP 1: 環境変数を設定（1分）

プロジェクトルートに `.env.local` を作成：

```bash
# .env.local
VITE_SUPABASE_URL=https://wirkjfsgwikhenxejeah.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_WI7U9SVKzVMR27GeQ_slkg_JP-hAA4e
```

### STEP 2: データベースをセットアップ（2分）

1. Supabase ダッシュボードを開く：
   ```
   https://supabase.com/dashboard/project/wirkjfsgwikhenxejeah/sql/new
   ```

2. **SQL Editor** → **+ New Query** をクリック

3. `database/simple-setup.sql` のすべての内容をコピー

4. SQL エディタにペースト → **RUN** をクリック

5. 画面上に `"Query executed"` が表示されたら成功 ✅

### STEP 3: アプリを起動（2分）

```bash
# ターミナルで実行
npm run dev
```

ブラウザで以下にアクセス：
```
http://localhost:5174
```

---

## 🧪 動作確認

### テストアカウントを作成

1. **サインアップ** をクリック
2. 以下を入力：
   ```
   メールアドレス: test@example.com
   パスワード: TestPassword123
   パスワード確認: TestPassword123
   ```
3. **アカウント登録** をクリック

### 成功したら ✅

- ダッシュボードが表示される
- 左上にユーザー名が表示される
- 各ページにアクセスできる

---

## ❌ エラーが出たら

### "invalid API key"

→ `.env.local` の値を確認してください

### "relation 'users' does not exist"

→ STEP 2 で SQL が正しく実行されたか確認してください

### "Email not confirmed"

→ Supabase で Email 認証設定を確認してください

**詳細は `COMPLETE_SETUP_GUIDE.md` を参照**

---

## 📊 ページ一覧

| ページ | URL | 説明 |
|--------|-----|------|
| ログイン | `/login` | メールアドレス＋パスワードでログイン |
| サインアップ | `/signup` | 新規アカウント登録 |
| ダッシュボード | `/` | KPI・メンバー勤怠表示 |
| 打刻 | `/checkin` | リアルタイム時刻・打刻ボタン |
| 勤怠一覧 | `/attendance` | 月別カレンダー・勤怠記録表示 |
| 修正申請 | `/correction` | 打刻修正申請フォーム |
| 承認待ち | `/approvals` | 修正申請の承認・却下 |
| レポート | `/report` | 月次勤怠レポート |
| 設定 | `/account-settings` | ユーザー設定・ログアウト |

---

## 🎯 よく使うコマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# テスト実行
npm run test

# 型チェック
npm run type-check
```

---

## 📚 詳細ドキュメント

- **完全セットアップ** → `COMPLETE_SETUP_GUIDE.md`
- **トラブルシューティング** → `SIGNUP_TROUBLESHOOTING.md`
- **RLS 設定** → `RLS_SETUP.md`
- **Supabase 統合** → `SUPABASE_SETUP.md`

---

## 💡 Tips

### ローカルストレージをクリア

```javascript
// ブラウザコンソール(F12 → Console)で実行
localStorage.clear()
location.reload()
```

### Supabase でユーザーを削除

1. Supabase ダッシュボード → **Authentication** → **Users**
2. ユーザーを選択 → **Delete user**
3. 再度サインアップ

### データをリセット

```sql
-- Supabase SQL Editor で実行
DELETE FROM attendances;
DELETE FROM users;
```

---

## 🚀 次のステップ

1. ✅ ログイン・サインアップが動作する
2. ✅ ダッシュボードが表示される
3. ✅ 各ページにアクセスできる

**以上ですべてのセットアップは完了です！**

楽しいアプリ開発を！ 🎉
