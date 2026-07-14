-- マイグレーション: RLSポリシーを admin/member の2つのロールに単純化

-- ============================================
-- 既存ポリシーをすべて削除
-- ============================================

DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Admin can update all users" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can create their own profile" ON users;

DROP POLICY IF EXISTS "Everyone can view departments" ON departments;
DROP POLICY IF EXISTS "Admin can update departments" ON departments;
DROP POLICY IF EXISTS "Admin can create departments" ON departments;

DROP POLICY IF EXISTS "Employees can view own attendance" ON attendances;
DROP POLICY IF EXISTS "Managers can view department attendance" ON attendances;
DROP POLICY IF EXISTS "Admin can view all attendance" ON attendances;
DROP POLICY IF EXISTS "Employees can create own attendance" ON attendances;
DROP POLICY IF EXISTS "Employees can update own attendance" ON attendances;
DROP POLICY IF EXISTS "Managers can update department attendance" ON attendances;
DROP POLICY IF EXISTS "Admin can update all attendance" ON attendances;

DROP POLICY IF EXISTS "Employees can view own corrections" ON correction_requests;
DROP POLICY IF EXISTS "Managers can view department corrections" ON correction_requests;
DROP POLICY IF EXISTS "Admin can view all corrections" ON correction_requests;
DROP POLICY IF EXISTS "Employees can create own corrections" ON correction_requests;
DROP POLICY IF EXISTS "Employees can update own pending corrections" ON correction_requests;
DROP POLICY IF EXISTS "Managers can update department corrections" ON correction_requests;
DROP POLICY IF EXISTS "Admin can update all corrections" ON correction_requests;

DROP POLICY IF EXISTS "Managers can view department approvals" ON approvals;
DROP POLICY IF EXISTS "Managers can create approvals for department" ON approvals;
DROP POLICY IF EXISTS "Managers can update approvals for department" ON approvals;
DROP POLICY IF EXISTS "Admin can create approvals" ON approvals;
DROP POLICY IF EXISTS "Admin can update approvals" ON approvals;

DROP POLICY IF EXISTS "Employees can view own leaves" ON leave_requests;
DROP POLICY IF EXISTS "Managers can view department leaves" ON leave_requests;
DROP POLICY IF EXISTS "Admin can view all leaves" ON leave_requests;
DROP POLICY IF EXISTS "Employees can create own leaves" ON leave_requests;
DROP POLICY IF EXISTS "Employees can update own pending leaves" ON leave_requests;
DROP POLICY IF EXISTS "Managers can update department leaves" ON leave_requests;
DROP POLICY IF EXISTS "Admin can update all leaves" ON leave_requests;

-- ============================================
-- 1. users テーブルのポリシー（簡略版）
-- ============================================

-- Admin: すべてのユーザーを表示・編集可能
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

-- Member: 自分のプロフィールのみ表示・編集可能
CREATE POLICY "Members can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Members can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- サインアップ時にユーザーが自分のプロフィールを作成
CREATE POLICY "Users can create their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- ============================================
-- 2. departments テーブルのポリシー（簡略版）
-- ============================================

-- 全員が部署情報を表示可能（組織構造は共有情報）
CREATE POLICY "Everyone can view departments"
  ON departments FOR SELECT
  USING (true);

-- Admin のみが部署を作成・更新
CREATE POLICY "Admin can create departments"
  ON departments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

CREATE POLICY "Admin can update departments"
  ON departments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- ============================================
-- 3. attendances テーブルのポリシー（簡略版）
-- ============================================

-- Admin: すべての勤怠記録を表示・編集
CREATE POLICY "Admin can view all attendance"
  ON attendances FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

CREATE POLICY "Admin can update all attendance"
  ON attendances FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

CREATE POLICY "Admin can insert attendance"
  ON attendances FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- Member: 自分の勤怠記録のみ操作可能
CREATE POLICY "Members can view own attendance"
  ON attendances FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Members can create own attendance"
  ON attendances FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Members can update own attendance"
  ON attendances FOR UPDATE
  USING (user_id::text = auth.uid()::text);

-- ============================================
-- 4. correction_requests テーブルのポリシー（簡略版）
-- ============================================

-- Admin: すべての修正申請を表示・編集
CREATE POLICY "Admin can view all corrections"
  ON correction_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

CREATE POLICY "Admin can update all corrections"
  ON correction_requests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

CREATE POLICY "Admin can insert corrections"
  ON correction_requests FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- Member: 自分の修正申請のみ操作可能
CREATE POLICY "Members can view own corrections"
  ON correction_requests FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Members can create own corrections"
  ON correction_requests FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Members can update own corrections"
  ON correction_requests FOR UPDATE
  USING (user_id::text = auth.uid()::text);

-- ============================================
-- 5. approvals テーブルのポリシー（簡略版）
-- ============================================

-- Admin のみが承認情報を操作
CREATE POLICY "Admin can view all approvals"
  ON approvals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

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
-- 6. leave_requests テーブルのポリシー（簡略版）
-- ============================================

-- Admin: すべての休暇申請を表示・編集
CREATE POLICY "Admin can view all leaves"
  ON leave_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

CREATE POLICY "Admin can update all leaves"
  ON leave_requests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

CREATE POLICY "Admin can insert leaves"
  ON leave_requests FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- Member: 自分の休暇申請のみ操作可能
CREATE POLICY "Members can view own leaves"
  ON leave_requests FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Members can create own leaves"
  ON leave_requests FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Members can update own leaves"
  ON leave_requests FOR UPDATE
  USING (user_id::text = auth.uid()::text);

-- ============================================
-- ロール定義を admin/member に統一
-- ============================================

UPDATE users SET role = 'member' WHERE role IN ('employee', 'manager');

-- ============================================
-- DELETE ポリシー（Admin のみ削除可能）
-- ============================================

-- users テーブル
CREATE POLICY "Admin can delete users"
  ON users FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- departments テーブル
CREATE POLICY "Admin can delete departments"
  ON departments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- attendances テーブル
CREATE POLICY "Admin can delete attendances"
  ON attendances FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- correction_requests テーブル
CREATE POLICY "Admin can delete correction requests"
  ON correction_requests FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- approvals テーブル
CREATE POLICY "Admin can delete approvals"
  ON approvals FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));

-- leave_requests テーブル
CREATE POLICY "Admin can delete leave requests"
  ON leave_requests FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin'
  ));
