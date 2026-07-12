-- Row Level Security (RLS) ポリシー設定
-- Supabase SQL Editor で実行してください

-- ============================================
-- 1. RLS を全テーブルで有効化
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE correction_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. users テーブルのポリシー
-- ============================================

-- 自分のユーザー情報のみ表示・編集可能
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text OR EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text OR EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

CREATE POLICY "Admin can view all users"
  ON users FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

CREATE POLICY "Admin can update all users"
  ON users FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- ============================================
-- 3. departments テーブルのポリシー
-- ============================================

-- 全員が部署情報を表示可能（組織構造は共有情報）
CREATE POLICY "Everyone can view departments"
  ON departments FOR SELECT
  USING (true);

-- 管理者のみが部署を更新
CREATE POLICY "Admin can update departments"
  ON departments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- 管理者のみが部署を作成
CREATE POLICY "Admin can create departments"
  ON departments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- ============================================
-- 4. attendances テーブルのポリシー
-- ============================================

-- 従業員は自分の勤怠記録のみ表示
CREATE POLICY "Employees can view own attendance"
  ON attendances FOR SELECT
  USING (user_id::text = auth.uid()::text);

-- マネージャーは自分の部署のメンバーの勤怠を表示
CREATE POLICY "Managers can view department attendance"
  ON attendances FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u1
    WHERE u1.id::text = auth.uid()::text AND u1.role = 'manager'
    AND u1.department_id = (
      SELECT department_id FROM users u2 WHERE u2.id = attendances.user_id
    )
  ));

-- 管理者は全勤怠記録を表示
CREATE POLICY "Admin can view all attendance"
  ON attendances FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- ユーザーは自分の勤怠記録を作成・更新
CREATE POLICY "Employees can create own attendance"
  ON attendances FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Employees can update own attendance"
  ON attendances FOR UPDATE
  USING (user_id::text = auth.uid()::text);

-- マネージャーは部下の勤怠を更新可能
CREATE POLICY "Managers can update department attendance"
  ON attendances FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users u1
    WHERE u1.id::text = auth.uid()::text AND u1.role = 'manager'
    AND u1.department_id = (
      SELECT department_id FROM users u2 WHERE u2.id = attendances.user_id
    )
  ));

-- 管理者は全勤怠記録を更新
CREATE POLICY "Admin can update all attendance"
  ON attendances FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- ============================================
-- 5. correction_requests テーブルのポリシー
-- ============================================

-- 従業員は自分の修正申請のみ表示
CREATE POLICY "Employees can view own corrections"
  ON correction_requests FOR SELECT
  USING (user_id::text = auth.uid()::text);

-- マネージャーは自分の部署の修正申請を表示
CREATE POLICY "Managers can view department corrections"
  ON correction_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u1
    WHERE u1.id::text = auth.uid()::text AND u1.role = 'manager'
    AND u1.department_id = (
      SELECT department_id FROM users u2 WHERE u2.id = correction_requests.user_id
    )
  ));

-- 管理者は全修正申請を表示
CREATE POLICY "Admin can view all corrections"
  ON correction_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- ユーザーは自分の修正申請を作成
CREATE POLICY "Employees can create own corrections"
  ON correction_requests FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

-- ユーザーは自分の修正申請を更新（ステータス pending のときのみ）
CREATE POLICY "Employees can update own pending corrections"
  ON correction_requests FOR UPDATE
  USING (user_id::text = auth.uid()::text AND status = 'pending');

-- マネージャーは部下の修正申請を更新
CREATE POLICY "Managers can update department corrections"
  ON correction_requests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users u1
    WHERE u1.id::text = auth.uid()::text AND u1.role = 'manager'
    AND u1.department_id = (
      SELECT department_id FROM users u2 WHERE u2.id = correction_requests.user_id
    )
  ));

-- 管理者は全修正申請を更新
CREATE POLICY "Admin can update all corrections"
  ON correction_requests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- ============================================
-- 6. approvals テーブルのポリシー
-- ============================================

-- マネージャーと管理者のみが承認情報を表示
CREATE POLICY "Managers can view department approvals"
  ON approvals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u
    WHERE u.id::text = auth.uid()::text
    AND (u.role = 'manager' OR u.role = 'admin')
  ));

-- マネージャーは部下の修正申請を承認
CREATE POLICY "Managers can create approvals for department"
  ON approvals FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM users u1, correction_requests cr
    WHERE u1.id::text = auth.uid()::text
    AND u1.role = 'manager'
    AND cr.id = approvals.correction_request_id
    AND u1.department_id = (
      SELECT department_id FROM users u2 WHERE u2.id = cr.user_id
    )
  ));

-- マネージャーは部下の承認を更新
CREATE POLICY "Managers can update approvals for department"
  ON approvals FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users u1, correction_requests cr
    WHERE u1.id::text = auth.uid()::text
    AND u1.role = 'manager'
    AND cr.id = approvals.correction_request_id
    AND u1.department_id = (
      SELECT department_id FROM users u2 WHERE u2.id = cr.user_id
    )
  ));

-- 管理者は全承認を作成・更新
CREATE POLICY "Admin can create approvals"
  ON approvals FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

CREATE POLICY "Admin can update approvals"
  ON approvals FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- ============================================
-- 7. leave_requests テーブルのポリシー
-- ============================================

-- 従業員は自分の休暇申請のみ表示
CREATE POLICY "Employees can view own leaves"
  ON leave_requests FOR SELECT
  USING (user_id::text = auth.uid()::text);

-- マネージャーは自分の部署の休暇申請を表示
CREATE POLICY "Managers can view department leaves"
  ON leave_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users u1
    WHERE u1.id::text = auth.uid()::text AND u1.role = 'manager'
    AND u1.department_id = (
      SELECT department_id FROM users u2 WHERE u2.id = leave_requests.user_id
    )
  ));

-- 管理者は全休暇申請を表示
CREATE POLICY "Admin can view all leaves"
  ON leave_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- ユーザーは自分の休暇申請を作成
CREATE POLICY "Employees can create own leaves"
  ON leave_requests FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

-- ユーザーは自分の休暇申請を更新（ステータス pending のときのみ）
CREATE POLICY "Employees can update own pending leaves"
  ON leave_requests FOR UPDATE
  USING (user_id::text = auth.uid()::text AND status = 'pending');

-- マネージャーは部下の休暇申請を更新
CREATE POLICY "Managers can update department leaves"
  ON leave_requests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users u1
    WHERE u1.id::text = auth.uid()::text AND u1.role = 'manager'
    AND u1.department_id = (
      SELECT department_id FROM users u2 WHERE u2.id = leave_requests.user_id
    )
  ));

-- 管理者は全休暇申請を更新
CREATE POLICY "Admin can update all leaves"
  ON leave_requests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- ============================================
-- RLS ポリシー確認用クエリ
-- ============================================

-- 有効になっているテーブルを確認
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;

-- ポリシーを確認
-- SELECT table_name, policy_name, permissive, roles, qual, with_check
-- FROM pg_policies
-- WHERE schema_name = 'public'
-- ORDER BY table_name, policy_name;
