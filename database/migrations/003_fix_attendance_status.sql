-- マイグレーション: attendances テーブルのステータス制約を修正
-- 問題: status CONSTRAINT が 'completed' を許可していない

-- 既存の制約を削除（Supabaseではアルターテーブルで制約削除が必要）
ALTER TABLE attendances DROP CONSTRAINT IF EXISTS status_check;

-- 新しい制約を追加（すべてのステータスを許可）
ALTER TABLE attendances ADD CONSTRAINT status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'working', 'completed'));
