# ユーザーテーブルリセットガイド

## 実行方法

### Supabaseを使用している場合

1. **Supabaseダッシュボードを開く**
   - https://app.supabase.com

2. **SQL Editorを開く**
   - 左メニュー → SQL Editor

3. **以下のSQLを実行**

```sql
BEGIN;

-- 外部キー制約を一時的に無効化
ALTER TABLE attendances DISABLE TRIGGER ALL;
ALTER TABLE correction_requests DISABLE TRIGGER ALL;
ALTER TABLE approvals DISABLE TRIGGER ALL;
ALTER TABLE leave_requests DISABLE TRIGGER ALL;
ALTER TABLE departments DISABLE TRIGGER ALL;

-- test@example.com以外のユーザーを削除
DELETE FROM users 
WHERE email != 'test@example.com';

-- 部署のマネージャーをリセット
UPDATE departments 
SET manager_id = NULL;

-- 外部キー制約を再度有効化
ALTER TABLE attendances ENABLE TRIGGER ALL;
ALTER TABLE correction_requests ENABLE TRIGGER ALL;
ALTER TABLE approvals ENABLE TRIGGER ALL;
ALTER TABLE leave_requests ENABLE TRIGGER ALL;
ALTER TABLE departments ENABLE TRIGGER ALL;

COMMIT;
```

4. **実行ボタンをクリック**

---

### ローカルPostgreSQLを使用している場合

```bash
# ターミナルで実行
psql kintai_db < database/reset_users.sql
```

---

## 実行後の確認

実行後、以下のコマンドでユーザーを確認：

```sql
SELECT * FROM users;
```

**期待される結果:**
- `test@example.com` のみが残っている
- その他のユーザーは削除されている

---

## テストアカウント情報

```
メール: test@example.com
パスワード: password123
```

このアカウントで新規登録やテストができます。

---

## ロールバック（やり直したい場合）

```bash
# サンプルデータを再度投入
psql kintai_db < database/seeds.sql
```
