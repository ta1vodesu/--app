-- ユーザーテーブルのリセット（テストアカウント除く）

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

-- 確認用クエリ
SELECT 'ユーザーリセット完了' as message;
SELECT COUNT(*) as remaining_users FROM users;
SELECT * FROM users;

COMMIT;
