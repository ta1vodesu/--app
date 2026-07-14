# Supabase テーブル構造の単純化 - マイグレーションガイド

## 概要

Supabaseのテーブル構造を以下のように単純化しました：

### 変更内容

| 旧構造 | 新構造 | 説明 |
|--------|--------|------|
| `users` | `profiles` | ユーザー情報テーブルを改名＋auth.usersと統合 |
| `correction_requests` + `approvals` | `corrections` | 修正申請と承認を統合 |
| `leave_requests` | 削除 | 初期段階では不要（永久削除） |

## 削除されるテーブル

### `leave_requests` テーブル
- **記録内容**: 従業員の休暇申請（有休、病休など）
- **削除理由**: MVP段階では不要
- **復活予定**: なし

### `approvals` テーブル
- **記録内容**: 修正申請の承認/却下レコード
- **統合先**: `corrections` テーブルに統合

### `users` テーブル
- **記録内容**: ユーザーマスタ
- **改名先**: `profiles` テーブルに改名
- **変更点**: `auth.users` との関連付けを改善

---

## 新スキーマ

### 1. `profiles` テーブル
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'employee',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `departments` テーブル（変更なし）
```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. `attendances` テーブル
```sql
CREATE TABLE attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  working_hours VARCHAR(50),
  break_time VARCHAR(50),
  overtime VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);
```

### 4. `corrections` テーブル（統合版）
```sql
CREATE TABLE corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attendance_id UUID NOT NULL REFERENCES attendances(id) ON DELETE CASCADE,
  original_check_in TIME,
  corrected_check_in TIME,
  original_check_out TIME,
  corrected_check_out TIME,
  reason TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  approver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approval_note TEXT,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## コード変更一覧

### 既に修正済みのファイル

✅ **データベース**
- `database/simplified_schema.sql` - 新スキーマ定義

✅ **型定義**
- `src/types/index.ts` - Profile, Correction型を更新

✅ **認証・コンテキスト**
- `src/context/AuthContext.tsx` - users → profiles
- `src/pages/AccountSettingsPage.tsx` - users → profiles

✅ **ダッシュボード・レポート**
- `src/pages/DashboardPage.tsx` - テーブル名・カラム名を統一
- `src/pages/MonthlyReportPage.tsx` - テーブル名・カラム名を統一

✅ **修正申請・承認**
- `src/pages/CorrectionRequestPage.tsx` - correction_requests → corrections + UI改善
- `src/pages/ApprovalPage.tsx` - correction_requests → corrections
- `src/services/correctionService.ts` - テーブル統合に対応

✅ **ユーティリティ**
- `src/utils/dashboardUtils.ts` - レポート計算ロジック

---

## マイグレーション手順

### ステップ 1: バックアップ（本番環境のみ）

```bash
# Supabaseバックアップ機能を使用
# Settings > Backups から手動バックアップを作成
```

### ステップ 2: Supabaseでスキーマを更新

```bash
# database/simplified_schema.sql をSupabase SQLエディタで実行
```

### ステップ 3: 既存データを移行

```sql
-- profiles テーブルにデータを移行
INSERT INTO profiles (id, email, name, role, department_id, is_active, created_at, updated_at)
SELECT id, email, name, role, department_id, is_active, created_at, updated_at
FROM users;

-- corrections テーブルにデータを移行
INSERT INTO corrections (
  id, user_id, attendance_id, original_check_in, corrected_check_in,
  original_check_out, corrected_check_out, reason, status,
  approver_id, approval_note, approved_at, created_at, updated_at
)
SELECT
  cr.id, cr.user_id, cr.attendance_id, cr.original_check_in, cr.corrected_check_in,
  cr.original_check_out, cr.corrected_check_out, cr.reason,
  CASE WHEN a.status = 'approved' THEN 'approved'
       WHEN a.status = 'rejected' THEN 'rejected'
       ELSE 'pending' END,
  a.approver_id, a.note, a.approved_at, cr.created_at, cr.updated_at
FROM correction_requests cr
LEFT JOIN approvals a ON cr.id = a.correction_request_id;

-- attendances を更新
ALTER TABLE attendances DROP CONSTRAINT IF EXISTS fk_users;
ALTER TABLE attendances
ADD CONSTRAINT fk_profiles
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
```

### ステップ 4: コードをデプロイ

すべてのコード変更は既に完了しています。

### ステップ 5: 旧テーブルを削除（マイグレーション完了後）

```sql
-- データが正常に移行されたことを確認した後
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS approvals CASCADE;
DROP TABLE IF EXISTS correction_requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

### ステップ 6: 検証

```bash
# TypeScriptチェック
npm run type-check

# ビルド
npm run build

# テスト実行
npm run test
```

---

## 注意事項

1. **バックアップ必須**: 本番環境の場合は、必ずマイグレーション前にバックアップを取ってください
2. **RLS ポリシー**: 新スキーマの RLS ポリシーを確認してセキュリティを確保してください
3. **ダウンタイム最小化**: マイグレーション中、ユーザーがデータにアクセスできない可能性があります
4. **ロールバック計画**: 問題発生時のロールバック手順を事前に準備してください

---

## トラブルシューティング

### エラー: "profiles table does not exist"

→ 新しいコードが古いテーブルを参照しています。すべてのコード変更が適用されているか確認してください。

### エラー: "FOREIGN KEY constraint failed"

→ 外部キー制約の順序を確認してください。以下の順序で作成する必要があります：
1. departments
2. profiles
3. attendances
4. corrections

### エラー: "Duplicate key value violates unique constraint"

→ 既存データに重複がないか確認してください。必要に応じて重複レコードを削除してから再実行してください。

### データ移行エラー

→ 既存の constraint を一時的に無効化してからデータを移行してください：

```sql
ALTER TABLE correction_requests DISABLE TRIGGER ALL;
-- データ移行SQL実行
ALTER TABLE correction_requests ENABLE TRIGGER ALL;
```

---

## サポート

問題が発生した場合は、以下の情報を確認してください：

1. Supabaseのエラーメッセージ
2. ブラウザのコンソールエラー
3. アプリケーションログ
4. データベースのサーバーログ
