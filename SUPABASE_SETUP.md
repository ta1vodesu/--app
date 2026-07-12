# Supabase統合ガイド

## セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセス
2. 新しいプロジェクトを作成
3. プロジェクト名と地域を設定
4. パスワードを設定

### 2. 環境変数の設定

`.env.local`ファイルを作成（`.env.example`を参考）：

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**取得方法:**
1. Supabaseダッシュボード → Settings → API
2. `Project URL` と `anon public` キーをコピー

### 3. データベーステーブルの作成

**SQL Editorで以下のスクリプトを実行:**

```sql
-- database/complete_setup.sql の内容をそのままコピー＆実行
```

### 4. 認証の設定

**Supabase ダッシュボード:**

1. Authentication → Providers
2. Email 認証を有効化
3. Confirm email: **disabled** (テスト用)
4. Site URL を設定: `http://localhost:5173`

### 5. RLS（Row Level Security）の設定

テーブルごとに以下のポリシーを設定：

**users テーブル:**
```sql
-- ユーザーは自分のデータのみアクセス可能
CREATE POLICY "Users can read own data"
ON users FOR SELECT
USING (auth.uid() = id);
```

**attendances テーブル:**
```sql
-- 従業員は自分の勤怠記録のみアクセス可能
CREATE POLICY "Users can read own attendances"
ON attendances FOR SELECT
USING (auth.uid() = user_id);

-- 従業員は自分の勤怠記録を作成・更新可能
CREATE POLICY "Users can manage own attendances"
ON attendances FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**correction_requests テーブル:**
```sql
-- 従業員は自分の修正申請のみアクセス可能
CREATE POLICY "Users can read own corrections"
ON correction_requests FOR SELECT
USING (auth.uid() = user_id);
```

### 6. サービスの利用

**Login/Signup:**
```typescript
import { authService } from '@/services/authService'

// ログイン
await authService.login(email, password)

// サインアップ
await authService.signup(email, password, name)

// ログアウト
await authService.logout()
```

**勤怠記録:**
```typescript
import { attendanceService } from '@/services/attendanceService'

// 勤怠一覧取得
const attendances = await attendanceService.getAttendances(userId, year, month)

// 出勤打刻
const attendance = await attendanceService.checkIn(userId, workType)

// 退勤打刻
await attendanceService.checkOut(attendanceId)
```

**修正申請:**
```typescript
import { correctionService } from '@/services/correctionService'

// 修正申請を作成
await correctionService.createCorrectionRequest(
  userId,
  attendanceId,
  { correctedCheckIn: '09:00:00' },
  '打刻ミスです'
)

// 待機中の申請を取得（マネージャー用）
const pending = await correctionService.getPendingRequests(managerId)

// 申請を承認
await correctionService.approveRequest(requestId, approverId)

// 申請を却下
await correctionService.rejectRequest(requestId, approverId)
```

## トラブルシューティング

### 認証エラー
- `.env.local` に正しい URL と ANON_KEY が設定されているか確認
- Supabase ダッシュボードでメール認証が有効化されているか確認

### データベース接続エラー
- RLS が有効になっていないか確認
- 認可ユーザーがテーブルにアクセスできるポリシーが設定されているか確認

### セッションの問題
- ブラウザの LocalStorage をクリア
- `.env.local` を再度確認

## マイグレーション

古いダミーデータから Supabase への移行：

1. ダミーデータをエクスポート（CSV）
2. Supabase にインポート
3. ユーザーが Supabase 認証で新規登録
4. 古いデータを削除

## セキュリティのベストプラクティス

- 本番環境では ANON_KEY ではなく SERVICE ROLE KEY を使用しないこと
- RLS ポリシーを必ず設定すること
- パスワードは bcrypt でハッシュ化すること
- API レート制限を設定すること
