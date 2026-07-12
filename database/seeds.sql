-- サンプルデータ投入スクリプト

BEGIN;

-- 部署データを挿入
INSERT INTO departments (id, name, manager_id) VALUES
('550e8400-e29b-41d4-a716-446655440001'::uuid, '営業部', NULL),
('550e8400-e29b-41d4-a716-446655440002'::uuid, '企画部', NULL),
('550e8400-e29b-41d4-a716-446655440003'::uuid, 'エンジニアリング部', NULL),
('550e8400-e29b-41d4-a716-446655440004'::uuid, '事務部', NULL);

-- ユーザーデータを挿入
INSERT INTO users (id, email, name, password_hash, role, department_id, is_active) VALUES
-- 管理者
('550e8400-e29b-41d4-a716-446655441001'::uuid, 'admin@claude.jp', '管理者太郎', '$2b$10$hashedpassword', 'admin', '550e8400-e29b-41d4-a716-446655440004'::uuid, true),

-- マネージャー
('550e8400-e29b-41d4-a716-446655441002'::uuid, 'manager1@claude.jp', '営業部長', '$2b$10$hashedpassword', 'manager', '550e8400-e29b-41d4-a716-446655440001'::uuid, true),
('550e8400-e29b-41d4-a716-446655441003'::uuid, 'manager2@claude.jp', '企画部長', '$2b$10$hashedpassword', 'manager', '550e8400-e29b-41d4-a716-446655440002'::uuid, true),

-- 従業員
('550e8400-e29b-41d4-a716-446655441004'::uuid, 'employee1@claude.jp', '田中太郎', '$2b$10$hashedpassword', 'employee', '550e8400-e29b-41d4-a716-446655440001'::uuid, true),
('550e8400-e29b-41d4-a716-446655441005'::uuid, 'employee2@claude.jp', '佐藤花子', '$2b$10$hashedpassword', 'employee', '550e8400-e29b-41d4-a716-446655440002'::uuid, true),
('550e8400-e29b-41d4-a716-446655441006'::uuid, 'employee3@claude.jp', '山田次郎', '$2b$10$hashedpassword', 'employee', '550e8400-e29b-41d4-a716-446655440003'::uuid, true);

-- 部署のマネージャー情報を更新
UPDATE departments SET manager_id = '550e8400-e29b-41d4-a716-446655441002'::uuid WHERE id = '550e8400-e29b-41d4-a716-446655440001'::uuid;
UPDATE departments SET manager_id = '550e8400-e29b-41d4-a716-446655441003'::uuid WHERE id = '550e8400-e29b-41d4-a716-446655440002'::uuid;

-- 勤怠記録データを挿入
INSERT INTO attendances (id, user_id, date, check_in_time, check_out_time, work_type, working_hours, status) VALUES
-- 2026年3月1日 - 営業部員
('550e8400-e29b-41d4-a716-446655442001'::uuid, '550e8400-e29b-41d4-a716-446655441004'::uuid, '2026-03-01', '09:00:00', '17:30:00', 'normal', '8h30m', 'approved'),
('550e8400-e29b-41d4-a716-446655442002'::uuid, '550e8400-e29b-41d4-a716-446655441005'::uuid, '2026-03-01', '09:15:00', '18:00:00', 'remote', '8h45m', 'approved'),

-- 2026年3月2日
('550e8400-e29b-41d4-a716-446655442003'::uuid, '550e8400-e29b-41d4-a716-446655441004'::uuid, '2026-03-02', '08:45:00', '17:15:00', 'normal', '8h30m', 'approved'),
('550e8400-e29b-41d4-a716-446655442004'::uuid, '550e8400-e29b-41d4-a716-446655441006'::uuid, '2026-03-02', '10:00:00', '19:00:00', 'normal', '9h00m', 'approved');

-- 修正申請データを挿入
INSERT INTO correction_requests (id, user_id, attendance_id, original_check_in, corrected_check_in, reason, status) VALUES
('550e8400-e29b-41d4-a716-446655443001'::uuid, '550e8400-e29b-41d4-a716-446655441004'::uuid, '550e8400-e29b-41d4-a716-446655442001'::uuid, '09:00:00', '08:50:00', '打刻ミスで修正をお願いします', 'pending');

-- 承認データを挿入
INSERT INTO approvals (id, correction_request_id, approver_id, status) VALUES
('550e8400-e29b-41d4-a716-446655444001'::uuid, '550e8400-e29b-41d4-a716-446655443001'::uuid, '550e8400-e29b-41d4-a716-446655441002'::uuid, 'pending');

-- 休暇申請データを挿入
INSERT INTO leave_requests (id, user_id, leave_date, leave_type, reason, status) VALUES
('550e8400-e29b-41d4-a716-446655445001'::uuid, '550e8400-e29b-41d4-a716-446655441005'::uuid, '2026-03-15', 'paid', 'GW前の連休', 'pending'),
('550e8400-e29b-41d4-a716-446655445002'::uuid, '550e8400-e29b-41d4-a716-446655441006'::uuid, '2026-03-20', 'sick', '体調不良', 'approved');

COMMIT;
