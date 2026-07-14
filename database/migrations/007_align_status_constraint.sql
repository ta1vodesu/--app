-- アプリが実際に書き込む status 値と CHECK 制約を一致させる
-- 出勤時: 'working' / 退勤時: 'worked'（既存データに 'completed' 'approved' 等も存在）
ALTER TABLE attendances DROP CONSTRAINT IF EXISTS status_check;

ALTER TABLE attendances ADD CONSTRAINT status_check
  CHECK (status IN (
    'pending',
    'approved',
    'rejected',
    'working',
    'worked',
    'completed',
    'holiday',
    'absent'
  ));
