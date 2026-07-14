-- profiles.role の CHECK 制約をアプリの動作と整合させる
-- 新規登録は 'employee' → 'member' の順で挿入を試すため、両方を許可する
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 想定外の値が既に入っていた場合は 'member' に正規化する
UPDATE profiles SET role = 'member' WHERE role NOT IN ('admin', 'member', 'employee');

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'member', 'employee'));

ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'employee';
