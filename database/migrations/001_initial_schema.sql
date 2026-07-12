-- 初期スキーママイグレーション
-- 実行日時: 自動生成
-- 説明: 勤怠管理アプリケーションの初期テーブル構築

BEGIN;

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
  manager_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ユーザーと部署の関係を追加
ALTER TABLE users
ADD CONSTRAINT fk_users_department
FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- 勤怠記録テーブル
CREATE TABLE attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT work_type_check CHECK (work_type IN ('normal', 'remote', 'business_trip')),
  CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected', 'working'))
);

-- 修正申請テーブル
CREATE TABLE correction_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  attendance_id UUID NOT NULL,
  original_check_in TIME,
  corrected_check_in TIME,
  original_check_out TIME,
  corrected_check_out TIME,
  reason TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (attendance_id) REFERENCES attendances(id) ON DELETE CASCADE,
  CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- 承認テーブル
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correction_request_id UUID NOT NULL,
  approver_id UUID NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  note TEXT,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (correction_request_id) REFERENCES correction_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- 休暇申請テーブル
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  leave_date DATE NOT NULL,
  leave_type VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT leave_type_check CHECK (leave_type IN ('paid', 'unpaid', 'sick', 'personal')),
  CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- インデックス作成
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

COMMIT;
