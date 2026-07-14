-- マイグレーション: attendances テーブルに一意制約を追加
-- 同じユーザーが同じ日に複数の勤怠記録を作成できないようにする

ALTER TABLE attendances
ADD CONSTRAINT unique_user_date UNIQUE (user_id, date);
