-- =========================================================================
-- 勤怠管理アプリケーション - 完全セットアップスクリプト
-- PostgreSQL用
-- このスクリプトはSQL Editorに直接貼り付けて実行できます
-- =========================================================================

-- ステップ1: UUID拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ステップ2: テーブル削除（既存の場合）
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS approvals CASCADE;
DROP TABLE IF EXISTS correction_requests CASCADE;
DROP TABLE IF EXISTS attendances CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- =========================================================================
-- テーブル定義
-- =========================================================================

-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'employee',
  department_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT role_check CHECK (role IN ('admin', 'manager', 'employee'))
);

-- 部署テーブル
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ユーザーに部署外部キーを追加
ALTER TABLE users
ADD CONSTRAINT fk_users_department
FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- 勤怠記録テーブル
CREATE TABLE attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  work_type VARCHAR(50) DEFAULT 'normal',
  break_times JSONB DEFAULT '[]',
  working_hours VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  memo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT work_type_check CHECK (work_type IN ('normal', 'remote', 'business_trip')),
  CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected', 'working'))
);

-- 修正申請テーブル
CREATE TABLE correction_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attendance_id UUID NOT NULL REFERENCES attendances(id) ON DELETE CASCADE,
  original_check_in TIME,
  corrected_check_in TIME,
  original_check_out TIME,
  corrected_check_out TIME,
  reason TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- 承認テーブル
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correction_request_id UUID NOT NULL REFERENCES correction_requests(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  note TEXT,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- 休暇申請テーブル
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leave_date DATE NOT NULL,
  leave_type VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT leave_type_check CHECK (leave_type IN ('paid', 'unpaid', 'sick', 'personal')),
  CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- =========================================================================
-- インデックス作成（パフォーマンス最適化）
-- =========================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_attendances_user_id ON attendances(user_id);
CREATE INDEX idx_attendances_date ON attendances(date);
CREATE INDEX idx_attendances_user_date ON attendances(user_id, date);
CREATE INDEX idx_correction_requests_user_id ON correction_requests(user_id);
CREATE INDEX idx_correction_requests_attendance_id ON correction_requests(attendance_id);
CREATE INDEX idx_approvals_approver_id ON approvals(approver_id);
CREATE INDEX idx_leave_requests_user_id ON leave_requests(user_id);
CREATE INDEX idx_leave_requests_date ON leave_requests(leave_date);

-- =========================================================================
-- サンプルデータ投入
-- =========================================================================

-- 部署データを挿入
INSERT INTO departments (name) VALUES
('営業部'),
('企画部'),
('エンジニアリング部'),
('事務部');

-- ユーザーデータを挿入
INSERT INTO users (email, name, password_hash, role, department_id, is_active) VALUES
-- 管理者
('admin@claude.jp', '管理者太郎', '$2b$10$hashedpassword', 'admin', (SELECT id FROM departments WHERE name = '事務部'), true),

-- マネージャー
('manager1@claude.jp', '営業部長', '$2b$10$hashedpassword', 'manager', (SELECT id FROM departments WHERE name = '営業部'), true),
('manager2@claude.jp', '企画部長', '$2b$10$hashedpassword', 'manager', (SELECT id FROM departments WHERE name = '企画部'), true),

-- 従業員
('employee1@claude.jp', '田中太郎', '$2b$10$hashedpassword', 'employee', (SELECT id FROM departments WHERE name = '営業部'), true),
('employee2@claude.jp', '佐藤花子', '$2b$10$hashedpassword', 'employee', (SELECT id FROM departments WHERE name = '企画部'), true),
('employee3@claude.jp', '山田次郎', '$2b$10$hashedpassword', 'employee', (SELECT id FROM departments WHERE name = 'エンジニアリング部'), true),
('employee4@claude.jp', '鈴木美咲', '$2b$10$hashedpassword', 'employee', (SELECT id FROM departments WHERE name = '営業部'), true),
('test@example.com', 'テストユーザー', '$2b$10$hashedpassword', 'employee', (SELECT id FROM departments WHERE name = 'エンジニアリング部'), true);

-- 部署のマネージャー情報を更新
UPDATE departments 
SET manager_id = (SELECT id FROM users WHERE email = 'manager1@claude.jp')
WHERE name = '営業部';

UPDATE departments 
SET manager_id = (SELECT id FROM users WHERE email = 'manager2@claude.jp')
WHERE name = '企画部';

-- 勤怠記録データを挿入（2026年3月）
INSERT INTO attendances (user_id, date, check_in_time, check_out_time, work_type, working_hours, status, memo) VALUES
-- 2026年3月1日
((SELECT id FROM users WHERE email = 'employee1@claude.jp'), '2026-03-01', '09:00:00', '17:30:00', 'normal', '8h30m', 'approved', NULL),
((SELECT id FROM users WHERE email = 'employee2@claude.jp'), '2026-03-01', '09:15:00', '18:00:00', 'remote', '8h45m', 'approved', NULL),
((SELECT id FROM users WHERE email = 'employee3@claude.jp'), '2026-03-01', '08:30:00', '17:00:00', 'normal', '8h30m', 'approved', NULL),

-- 2026年3月2日
((SELECT id FROM users WHERE email = 'employee1@claude.jp'), '2026-03-02', '08:45:00', '17:15:00', 'normal', '8h30m', 'approved', NULL),
((SELECT id FROM users WHERE email = 'employee2@claude.jp'), '2026-03-02', '09:30:00', '18:30:00', 'normal', '9h00m', 'approved', NULL),
((SELECT id FROM users WHERE email = 'employee3@claude.jp'), '2026-03-02', '10:00:00', '19:00:00', 'business_trip', '9h00m', 'approved', '営業先で作業'),

-- 2026年3月3日
((SELECT id FROM users WHERE email = 'employee1@claude.jp'), '2026-03-03', '09:00:00', '17:30:00', 'normal', '8h30m', 'approved', NULL),
((SELECT id FROM users WHERE email = 'employee4@claude.jp'), '2026-03-03', '08:50:00', '17:30:00', 'normal', '8h40m', 'pending', NULL),

-- 2026年3月4日
((SELECT id FROM users WHERE email = 'employee2@claude.jp'), '2026-03-04', '09:00:00', '17:00:00', 'remote', '8h00m', 'approved', NULL),
((SELECT id FROM users WHERE email = 'employee3@claude.jp'), '2026-03-04', '09:30:00', '18:00:00', 'normal', '8h30m', 'approved', NULL);

-- 修正申請データを挿入
INSERT INTO correction_requests (user_id, attendance_id, original_check_in, corrected_check_in, reason, status) VALUES
((SELECT id FROM users WHERE email = 'employee4@claude.jp'), 
 (SELECT id FROM attendances WHERE user_id = (SELECT id FROM users WHERE email = 'employee4@claude.jp') AND date = '2026-03-03'),
 '08:50:00', '08:45:00', '打刻ミスで修正をお願いします', 'pending');

-- 承認データを挿入
INSERT INTO approvals (correction_request_id, approver_id, status) VALUES
((SELECT id FROM correction_requests WHERE user_id = (SELECT id FROM users WHERE email = 'employee4@claude.jp') LIMIT 1),
 (SELECT id FROM users WHERE email = 'manager1@claude.jp'),
 'pending');

-- 休暇申請データを挿入
INSERT INTO leave_requests (user_id, leave_date, leave_type, reason, status) VALUES
((SELECT id FROM users WHERE email = 'employee2@claude.jp'), '2026-03-15', 'paid', 'GW前の連休', 'pending'),
((SELECT id FROM users WHERE email = 'employee3@claude.jp'), '2026-03-20', 'sick', '体調不良', 'approved'),
((SELECT id FROM users WHERE email = 'employee1@claude.jp'), '2026-03-25', 'paid', '年次休暇', 'approved');

-- =========================================================================
-- セットアップ完了メッセージ
-- =========================================================================
SELECT 'セットアップが完了しました！' as message;

-- テーブル確認用クエリ
-- ユーザー数
SELECT COUNT(*) as user_count FROM users;

-- 部署数
SELECT COUNT(*) as department_count FROM departments;

-- 勤怠記録数
SELECT COUNT(*) as attendance_count FROM attendances;

-- 修正申請数
SELECT COUNT(*) as correction_request_count FROM correction_requests;

-- 休暇申請数
SELECT COUNT(*) as leave_request_count FROM leave_requests;
