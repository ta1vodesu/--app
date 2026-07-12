# Supabase APIでユーザーをリセット

## 準備

### SERVICE_ROLE_KEY の取得

1. Supabaseダッシュボード → Settings → API
2. `service_role` キーをコピー
   - **注意**: これは秘密鍵です。絶対に共有しないでください

### 環境変数の確認

`.env.local` に以下が設定されていることを確認：

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 実行方法

### ターミナルで実行

```bash
cd /Users/kazumaogata/taiyo\ kennsyuu/勤怠管理-app

# 環境変数を設定してスクリプト実行
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
node scripts/reset-users.js
```

### 自動化スクリプト

`.env.local`から自動で読み込む場合：

```bash
# .env.local に以下を追加
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# スクリプト実行
node scripts/reset-users.js
```

## 実行例

```
🔄 Supabase ユーザーリセット開始...

📋 ユーザー一覧を取得中...
✅ 8 件のユーザーが見つかりました

🗑️  7 件のユーザーを削除します:

  - admin@claude.jp
  - manager1@claude.jp
  - manager2@claude.jp
  - employee1@claude.jp
  - employee2@claude.jp
  - employee3@claude.jp
  - employee4@claude.jp

✅ 削除完了: admin@claude.jp
✅ 削除完了: manager1@claude.jp
...

✨ ユーザーリセット完了！
📧 テストアカウント: test@example.com
🔐 パスワード: password123
```

## テスト後

ユーザーをリセット後：

1. ブラウザをリロード（F5）
2. ログイン画面でテスト
   - メール: `test@example.com`
   - パスワード: `password123`

## ロールバック

ユーザーを復旧したい場合：

```bash
psql kintai_db < database/seeds.sql
```

## トラブルシューティング

### "Failed to fetch users" エラー
- SERVICE_ROLE_KEY が正しいか確認
- Supabase プロジェクトが正しいか確認

### "Cannot delete" エラー
- test@example.com のみが削除対象外です
- 他のメールアドレスは削除されます
