-- 勤怠管理アプリ - シンプルセットアップ用 SQL
-- Supabase SQL Editor にこの内容をすべてコピペして実行してください

-- =====================================================
-- 1. テーブル作成
-- =====================================================

-- users テーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'employee',
  department_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- departments テーブル
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  manager_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- attendances テーブル
CREATE TABLE IF NOT EXISTS attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  working_hours VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, date)
);

-- correction_requests テーブル
CREATE TABLE IF NOT EXISTS correction_requests (
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
  FOREIGN KEY (attendance_id) REFERENCES attendances(id) ON DELETE CASCADE
);

-- =====================================================
-- 2. インデックス作成
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_attendances_user_id ON attendances(user_id);
CREATE INDEX IF NOT EXISTS idx_attendances_date ON attendances(date);
CREATE INDEX IF NOT EXISTS idx_attendances_user_date ON attendances(user_id, date);
CREATE INDEX IF NOT EXISTS idx_correction_requests_user_id ON correction_requests(user_id);

-- =====================================================
-- 3. RLS（Row Level Security）有効化
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE correction_requests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. RLS ポリシー作成
-- =====================================================

-- users テーブルのポリシー
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

-- departments テーブルのポリシー（全員閲覧可能）
CREATE POLICY "Everyone can view departments"
  ON departments FOR SELECT
  USING (true);

-- attendances テーブルのポリシー
CREATE POLICY "Users can view own attendance"
  ON attendances FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create own attendance"
  ON attendances FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own attendance"
  ON attendances FOR UPDATE
  USING (user_id::text = auth.uid()::text);

-- correction_requests テーブルのポリシー
CREATE POLICY "Users can view own corrections"
  ON correction_requests FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create own corrections"
  ON correction_requests FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

-- =====================================================
-- セットアップ完了
-- =====================================================
-- すべてのコマンドが実行されました。
-- テーブルを確認するには以下を実行：
-- SELECT * FROM users;
-- SELECT * FROM departments;
-- SELECT * FROM attendances;
