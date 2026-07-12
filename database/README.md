# 勤怠管理アプリケーション - データベース設定

## ファイル構成

- `schema.sql` - PostgreSQL用のデータベーススキーマ定義
- `migrations/` - マイグレーションファイル置き場

## テーブル一覧

### 1. users (ユーザーテーブル)

```
id (UUID, 主キー) - ユーザーの一意識別子
email (VARCHAR) - メールアドレス (UNIQUE)
name (VARCHAR) - ユーザー名
password_hash (VARCHAR) - パスワードハッシュ
role (VARCHAR) - ロール (admin, manager, employee)
department_id (UUID) - 部署ID (外部キー)
is_active (BOOLEAN) - アクティブ状態
created_at (TIMESTAMP) - 作成日時
updated_at (TIMESTAMP) - 更新日時
```

### 2. departments (部署テーブル)

```
id (UUID, 主キー) - 部署の一意識別子
name (VARCHAR) - 部署名
manager_id (UUID) - マネージャーID (外部キー)
created_at (TIMESTAMP) - 作成日時
updated_at (TIMESTAMP) - 更新日時
```

### 3. attendances (勤怠記録テーブル)

```
id (UUID, 主キー) - 勤怠記録の一意識別子
user_id (UUID) - ユーザーID (外部キー)
date (DATE) - 勤務日
check_in_time (TIME) - 出勤時刻
check_out_time (TIME) - 退勤時刻
work_type (VARCHAR) - 勤務形態 (normal, remote, business_trip)
break_times (JSONB) - 休憩時間 (複数対応)
working_hours (VARCHAR) - 勤務時間
status (VARCHAR) - ステータス (pending, approved, rejected, working)
memo (TEXT) - メモ
created_at (TIMESTAMP) - 作成日時
updated_at (TIMESTAMP) - 更新日時
```

### 4. correction_requests (修正申請テーブル)

```
id (UUID, 主キー) - 修正申請の一意識別子
user_id (UUID) - ユーザーID (外部キー)
attendance_id (UUID) - 勤怠記録ID (外部キー)
original_check_in (TIME) - 元の出勤時刻
corrected_check_in (TIME) - 修正後の出勤時刻
original_check_out (TIME) - 元の退勤時刻
corrected_check_out (TIME) - 修正後の退勤時刻
reason (TEXT) - 修正理由
status (VARCHAR) - ステータス (pending, approved, rejected)
created_at (TIMESTAMP) - 作成日時
updated_at (TIMESTAMP) - 更新日時
```

### 5. approvals (承認テーブル)

```
id (UUID, 主キー) - 承認の一意識別子
correction_request_id (UUID) - 修正申請ID (外部キー)
approver_id (UUID) - 承認者ID (外部キー)
status (VARCHAR) - ステータス (pending, approved, rejected)
note (TEXT) - 備考
approved_at (TIMESTAMP) - 承認日時
created_at (TIMESTAMP) - 作成日時
updated_at (TIMESTAMP) - 更新日時
```

### 6. leave_requests (休暇申請テーブル)

```
id (UUID, 主キー) - 休暇申請の一意識別子
user_id (UUID) - ユーザーID (外部キー)
leave_date (DATE) - 休暇予定日
leave_type (VARCHAR) - 休暇種別 (paid, unpaid, sick, personal)
reason (TEXT) - 休暇理由
status (VARCHAR) - ステータス (pending, approved, rejected)
created_at (TIMESTAMP) - 作成日時
updated_at (TIMESTAMP) - 更新日時
```

## セットアップ方法

### PostgreSQL

```bash
# データベース作成
createdb kintai_db

# スキーマ適用
psql kintai_db < database/schema.sql

# またはマイグレーション実行
psql kintai_db < database/migrations/001_initial_schema.sql
```

### MySQL

MySQL用のスキーマに変換するには、以下の変更が必要です：

```sql
-- UUID代わりにCHAR(36)またはBINARY(16)を使用
-- gen_random_uuid()代わりにUUID()を使用
-- JSONBの代わりにJSON型を使用
```

## 特徴

### UUIDの採用
- すべてのテーブルで`UUID`を主キーとして使用
- `gen_random_uuid()`で自動生成
- スケーラビリティとセキュリティを向上

### created_atとupdated_at
- すべてのテーブルにタイムスタンプカラムを追加
- 作成日時と更新日時を自動トラッキング
- 監査ログとしても機能

### 外部キー制約
- 適切なCASCADE/SET NULLを設定
- データの整合性を保証

### インデックス
- 頻繁なクエリに対応するインデックスを作成
- パフォーマンスを最適化

## 注意事項

- PostgreSQLのバージョン10以上を推奨
- UUIDは`uuid-ossp`拡張機能が必要
- JSONBカラムはPostgreSQL 9.4以上で利用可能

```sql
-- UUID拡張機能の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```
