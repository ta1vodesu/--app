-- 既存の NULL ステータスを 'working' に修正
UPDATE attendances
SET status = 'working'
WHERE status IS NULL
  AND check_in_time IS NOT NULL;

-- 退勤したレコードは 'worked' に修正
UPDATE attendances
SET status = 'worked'
WHERE check_out_time IS NOT NULL
  AND status != 'worked'
  AND status != 'holiday'
  AND status != 'absent';

-- デフォルト制約を追加（今後のレコード用）
ALTER TABLE attendances
ALTER COLUMN status SET DEFAULT 'working';
