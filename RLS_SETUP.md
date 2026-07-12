# Row Level Security (RLS) セットアップガイド

## 概要

Row Level Security (RLS) は PostgreSQL の機能で、テーブルレベルでアクセス制御を実装できます。
このガイドでは、Supabase で RLS を設定し、ユーザーが自分のデータのみアクセスできるようにします。

---

## 🔐 RLS ポリシー概要

### **ロール別アクセス権限**

| ロール | 権限 |
|--------|------|
| **employee** | 自分のデータのみ表示・編集 |
| **manager** | 自分の部署のメンバーのデータを表示・編集 |
| **admin** | 全データの表示・編集・削除 |

---

## 📋 テーブル別ポリシー

### **1. users テーブル**

```sql
-- 自分のプロフィールを表示・編集
SELECT: user_id = auth.uid() OR is_admin()
UPDATE: user_id = auth.uid() OR is_admin()

-- 管理者はすべてのユーザーを表示・編集
SELECT: is_admin()
UPDATE: is_admin()
```

**設定内容**:
- ✅ ユーザーは自分の情報のみ表示・編集
- ✅ 管理者は全ユーザー情報にアクセス可能

---

### **2. departments テーブル**

```sql
-- 全員が部署情報を表示（組織構造は共有情報）
SELECT: true

-- 管理者のみが部署を作成・編集
INSERT: is_admin()
UPDATE: is_admin()
DELETE: is_admin()
```

**設定内容**:
- ✅ 全員が部署情報を表示可能
- ✅ 管理者のみが部署を管理

---

### **3. attendances テーブル**

```sql
-- 従業員：自分の勤怠のみ表示・編集
SELECT: user_id = auth.uid()
INSERT: user_id = auth.uid()
UPDATE: user_id = auth.uid()

-- マネージャー：自分の部署の勤怠を表示・編集
SELECT: is_manager_of(user_id)
UPDATE: is_manager_of(user_id)

-- 管理者：全勤怠を表示・編集
SELECT: is_admin()
UPDATE: is_admin()
```

**設定内容**:
- ✅ 従業員は自分の勤怠記録のみアクセス
- ✅ マネージャーは部下の勤怠を確認・編集可能
- ✅ 管理者は全データにアクセス

---

### **4. correction_requests テーブル**

```sql
-- 従業員：自分の修正申請のみ表示・編集
SELECT: user_id = auth.uid()
INSERT: user_id = auth.uid()
UPDATE: user_id = auth.uid() AND status = 'pending'

-- マネージャー：自分の部署の修正申請を表示・編集
SELECT: is_manager_of(user_id)
UPDATE: is_manager_of(user_id)

-- 管理者：全修正申請を表示・編集
SELECT: is_admin()
UPDATE: is_admin()
```

**設定内容**:
- ✅ 従業員は自分の修正申請のみ操作
- ✅ 保留中（pending）の申請のみ編集可能
- ✅ マネージャーは部下の申請を承認可能
- ✅ 管理者は全申請を管理

---

### **5. approvals テーブル**

```sql
-- マネージャー：部下の承認を作成・編集
INSERT: is_manager_of(correction_request.user_id)
UPDATE: is_manager_of(correction_request.user_id)

-- 管理者：全承認を作成・編集
INSERT: is_admin()
UPDATE: is_admin()
```

**設定内容**:
- ✅ マネージャーは部下の修正申請を承認
- ✅ 管理者は全件を承認可能

---

### **6. leave_requests テーブル**

```sql
-- 従業員：自分の休暇申請のみ表示・編集
SELECT: user_id = auth.uid()
INSERT: user_id = auth.uid()
UPDATE: user_id = auth.uid() AND status = 'pending'

-- マネージャー：自分の部署の休暇申請を表示・編集
SELECT: is_manager_of(user_id)
UPDATE: is_manager_of(user_id)

-- 管理者：全休暇申請を表示・編集
SELECT: is_admin()
UPDATE: is_admin()
```

**設定内容**:
- ✅ 従業員は自分の休暇申請のみ操作
- ✅ 保留中（pending）の申請のみ編集可能
- ✅ マネージャーは部下の申請を承認可能

---

## 🚀 セットアップ手順

### 1️⃣ Supabase SQL Editor を開く

```
https://supabase.com/dashboard/project/wirkjfsgwikhenxejeah/sql/new
```

### 2️⃣ `database/rls-policies.sql` をコピー

ファイル全体をコピーしてください

### 3️⃣ SQL Editor にペースト

テキストボックスに貼り付け

### 4️⃣ RUN ボタンをクリック

すべてのポリシーが作成されます

### 5️⃣ 確認クエリを実行（オプション）

```sql
-- RLS が有効なテーブルを確認
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 作成されたポリシーを確認
SELECT table_name, policy_name, permissive, roles, qual, with_check
FROM pg_policies
WHERE schema_name = 'public'
ORDER BY table_name, policy_name;
```

---

## ✅ セットアップ完了確認

以下のテーブルで RLS が有効になっていることを確認：

- ✅ users
- ✅ departments
- ✅ attendances
- ✅ correction_requests
- ✅ approvals
- ✅ leave_requests

---

## 🔍 ポリシーの動作確認

### **テスト用クエリ**

```sql
-- 現在のユーザーが取得できるデータ
SELECT * FROM attendances;
-- → 自分の勤怠記録のみ表示

-- マネージャーが部下のデータを確認
SELECT u.name, a.date, a.check_in_time, a.check_out_time
FROM attendances a
JOIN users u ON a.user_id = u.id
WHERE u.department_id = (SELECT department_id FROM users WHERE id = auth.uid());
```

---

## ⚠️ トラブルシューティング

### **「Permission denied」エラーが出る**

1. RLS が有効になっているか確認
2. ポリシーが正しく作成されているか確認
3. auth.uid() が正しく取得できているか確認

### **管理者が全データを取得できない**

1. users テーブルで role が 'admin' に設定されているか確認
2. ポリシーのクエリを再実行

### **マネージャーが部下のデータを取得できない**

1. マネージャーの department_id が設定されているか確認
2. 部下の department_id がマネージャーと同じか確認

---

## 📚 参考資料

- [Supabase RLS ドキュメント](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase セキュリティベストプラクティス](https://supabase.com/docs/guides/security/overview)

---

## 🔐 セキュリティベストプラクティス

1. **最小権限の原則**
   - ユーザーには必要最小限の権限のみを付与

2. **ロール分離**
   - employee, manager, admin の3ロールに明確に分離

3. **監査ログ**
   - 重要な操作はログに記録（audit_logs テーブル）

4. **定期レビュー**
   - ポリシーを定期的に見直し、アクセス権限を確認

5. **パスワード管理**
   - Supabase の認証設定で強力なパスワードポリシーを有効化
