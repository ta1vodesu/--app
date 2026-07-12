# サインアップ失敗のトラブルシューティング

## 🔍 デバッグ手順

### 1️⃣ ブラウザコンソールで確認
1. Chrome / Firefox の **Developer Tools** を開く（F12）
2. **Console** タブをクリック
3. サインアップしてエラーメッセージを確認
4. 表示されたエラーメッセージをメモ

---

## 📋 よくあるエラーと対応

### **エラー: "invalid API key"**
```
❌ Error: invalid API key
```

**原因**: Supabase 認証情報が間違っている

**対応**:
1. `.env.local` を確認
2. Supabase ダッシュボード → Settings → API で確認
3. `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を正確にコピー
4. ダッシュボードをリロード（Ctrl+Shift+R）

---

### **エラー: "User already registered"**
```
❌ Error: User already registered
```

**原因**: そのメールアドレスはすでに登録されている

**対応**:
1. 別のメールアドレスを使用
2. または Supabase ダッシュボード → Authentication でユーザーを削除して再登録

---

### **エラー: "Database connection error"**
```
❌ Error: relation "users" does not exist
```

**原因**: Supabase にテーブルが作成されていない

**対応**:
1. Supabase SQL Editor を開く
2. `database/complete_setup.sql` を実行
3. テーブルが作成されたか確認

```bash
# Supabase ダッシュボードで確認
SQL Editor → "SELECT * FROM users" を実行
```

---

### **エラー: "Email not confirmed"**
```
❌ Error: Email not confirmed
```

**原因**: メール確認が必須設定になっている

**対応**:
1. Supabase ダッシュボード → Authentication → Providers
2. Email の設定を確認
3. "Confirm email" を **disabled** に変更
4. Save をクリック

---

### **エラー: "Password is too weak"**
```
❌ Error: Password is too weak
```

**原因**: パスワードが要件を満たしていない

**対応**:
- 8文字以上で、大文字・小文字・数字を含むパスワードを使用
- 例: `MyPassword123`

---

## ✅ チェックリスト

サインアップが失敗する場合、以下を確認：

- [ ] `.env.local` ファイルが存在する
- [ ] `VITE_SUPABASE_URL` が正しく設定されている
- [ ] `VITE_SUPABASE_ANON_KEY` が正しく設定されている
- [ ] Supabase プロジェクトが作成されている
- [ ] テーブルが作成されている（`database/complete_setup.sql` を実行）
- [ ] Email 認証が有効化されている
- [ ] "Confirm email" が **disabled** に設定されている
- [ ] パスワードが6文字以上である
- [ ] メールアドレスが有効な形式である
- [ ] ブラウザのコンソールにエラーメッセージが表示されている

---

## 🧪 テスト方法

### 方法1: コンソールで直接テスト
```typescript
// ブラウザコンソール(F12 → Console)で実行
import { supabase } from '@/lib/supabase'

await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'TestPassword123'
})
```

### 方法2: Supabase ダッシュボードで確認
1. Authentication → Users
2. ユーザーが作成されているか確認
3. ユーザーの詳細を確認

---

## 🚀 正常な流れ

✅ **サインアップが成功したら**:
1. ユーザーが作成される
2. ダッシュボード（/）にリダイレクト
3. 左上に認証済みユーザーが表示される

---

## 💡 その他の確認

### ネットワーク確認
1. DevTools → Network タブを開く
2. サインアップをクリック
3. `auth/v1/signup` のリクエストを確認
4. ステータスコードが `200` か確認

### コンソールログ確認
1. DevTools → Console を開く
2. フィルタで `"auth"` または `"signup"` を検索
3. すべてのエラーメッセージを記録

---

## 📞 サポート

### Supabase 公式ドキュメント
- [Authentication ドキュメント](https://supabase.com/docs/guides/auth)
- [トラブルシューティング](https://supabase.com/docs/guides/auth/troubleshooting)

### よくある質問

**Q: メールアドレスにメールが来ない**
```
A: 確認メールが無効化されているか確認してください
Authentication → Providers → Email → "Confirm email" = disabled
```

**Q: パスワードリセットしたい**
```
A: Supabase ダッシュボード → Authentication → Users → ユーザーを選択 → 削除
再度サインアップしてください
```

**Q: ユーザーデータが見当たらない**
```
A: "users" テーブルが存在するか確認
SQL Editor → SELECT * FROM users;
```

---

## 🔧 リセット方法

**完全にリセットしたい場合**:

1. Supabase プロジェクトを削除
2. 新しいプロジェクトを作成
3. 認証設定をやり直す
4. テーブルを再作成する

```bash
# ローカルリセット
rm .env.local
npm run dev
```
