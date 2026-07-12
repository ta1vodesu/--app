# Supabase データベースセットアップガイド

## 📌 テーブル一覧

| テーブル | 説明 |
|----------|------|
| **profiles** | ユーザープロフィール（必須） |
| **attendances** | 勤怠記録（必須） |
| **departments** | 部署管理 |
| **correction_requests** | 修正申請 |
| **approvals** | 承認管理 |
| **leaves** | 休暇申請 |
| **leave_balance** | 休暇残数管理 |
| **audit_logs** | 監査ログ |

---

## 🚀 セットアップ手順

### 1️⃣ Supabase ダッシュボードにログイン
```
https://supabase.com/dashboard/project/wirkjfsgwikhenxejeah/sql/new
```

### 2️⃣ SQL エディタを開く
- 左サイドバーの「SQL」をクリック
- 「+ New Query」をクリック

### 3️⃣ SQL スクリプトを実行
`database/schema.sql` の内容をコピーして、SQL エディタに貼り付けます

```sql
-- ここに database/schema.sql の内容をペースト
```

### 4️⃣ 「RUN」ボタンをクリック

---

## 📊 テーブルスキーマ詳細

### **profiles** テーブル
ユーザー情報を管理します

```
id          : UUID (Primary Key) - auth.users と連携
email       : TEXT (Unique) - メールアドレス
name        : TEXT - 名前
department_id : UUID - 部署ID（外部キー）
position    : TEXT - 職位
phone       : TEXT - 電話番号
initials    : VARCHAR(2) - イニシャル
role        : TEXT - ロール（employee/manager/admin）
join_date   : DATE - 入社日
avatar_url  : TEXT - アバターURL
created_at  : TIMESTAMP - 作成日時
updated_at  : TIMESTAMP - 更新日時
```

### **attendances** テーブル
勤怠記録を管理します

```
id              : UUID (Primary Key)
user_id         : UUID - ユーザーID（外部キー）
date            : DATE - 勤務日（user_id と date で一意）
check_in_time   : TIME - 出勤時刻
check_out_time  : TIME - 退勤時刻
working_hours   : TEXT - 勤務時間
break_time      : TEXT - 休憩時間
overtime        : TEXT - 残業時間
status          : TEXT - ステータス（working/holiday/absent/pending）
notes           : TEXT - 備考
created_at      : TIMESTAMP - 作成日時
updated_at      : TIMESTAMP - 更新日時
```

### **correction_requests** テーブル
修正申請を管理します

```
id                  : UUID (Primary Key)
user_id             : UUID - ユーザーID（外部キー）
attendance_id       : UUID - 勤怠ID（外部キー）
original_check_in   : TIME - 元の出勤時刻
corrected_check_in  : TIME - 修正後の出勤時刻
original_check_out  : TIME - 元の退勤時刻
corrected_check_out : TIME - 修正後の退勤時刻
reason              : TEXT - 理由
status              : TEXT - ステータス（pending/approved/rejected）
reviewed_by         : UUID - レビュアーID
reviewed_at         : TIMESTAMP - レビュー日時
created_at          : TIMESTAMP - 作成日時
updated_at          : TIMESTAMP - 更新日時
```

### **approvals** テーブル
承認管理を行います

```
id                      : UUID (Primary Key)
correction_request_id   : UUID - 修正申請ID（外部キー）
approver_id             : UUID - 承認者ID（外部キー）
status                  : TEXT - ステータス（pending/approved/rejected）
approval_note           : TEXT - 承認コメント
approved_at             : TIMESTAMP - 承認日時
created_at              : TIMESTAMP - 作成日時
updated_at              : TIMESTAMP - 更新日時
```

### **leaves** テーブル
休暇申請を管理します

```
id           : UUID (Primary Key)
user_id      : UUID - ユーザーID（外部キー）
date         : DATE - 休暇日（user_id と date で一意）
leave_type   : TEXT - 休暇種別（paid/unpaid/sick/personal）
reason       : TEXT - 理由
status       : TEXT - ステータス（pending/approved/rejected）
approved_by  : UUID - 承認者ID
approved_at  : TIMESTAMP - 承認日時
created_at   : TIMESTAMP - 作成日時
updated_at   : TIMESTAMP - 更新日時
```

### **leave_balance** テーブル
休暇残数を管理します

```
id                  : UUID (Primary Key)
user_id             : UUID - ユーザーID（外部キー）
year                : INTEGER - 年度（user_id と year で一意）
paid_leave_total    : INTEGER - 有給休暇総数
paid_leave_used     : INTEGER - 有給休暇使用数
sick_leave_total    : INTEGER - 病気休暇総数
sick_leave_used     : INTEGER - 病気休暇使用数
updated_at          : TIMESTAMP - 更新日時
```

### **audit_logs** テーブル
全操作履歴を記録します

```
id          : UUID (Primary Key)
user_id     : UUID - ユーザーID
action      : TEXT - アクション
table_name  : TEXT - テーブル名
record_id   : UUID - レコードID
old_values  : JSONB - 変更前の値
new_values  : JSONB - 変更後の値
ip_address  : TEXT - IPアドレス
user_agent  : TEXT - User Agent
created_at  : TIMESTAMP - 作成日時
```

---

## 🔐 セキュリティ設定

### Row Level Security (RLS) 有効化
すべてのテーブルで RLS が有効化されています。

**ポリシー概要**:
- ユーザーは自分のデータのみ表示・編集可能
- マネージャーは自分の部署のデータを表示可能
- 管理者（admin）はすべてのデータにアクセス可能

---

## 📍 インデックス

パフォーマンス向上のため、以下のインデックスが作成されています：

```
- attendances: user_id, date, (user_id, date)
- correction_requests: user_id, status
- leaves: user_id, date
- audit_logs: user_id, table_name
```

---

## ✅ セットアップ完了確認

セットアップ後、Supabase ダッシュボードの「Tables」セクションで以下のテーブルが表示されることを確認してください：

- ✅ profiles
- ✅ attendances
- ✅ departments
- ✅ correction_requests
- ✅ approvals
- ✅ leaves
- ✅ leave_balance
- ✅ audit_logs

---

## 🔗 関連リンク

- Supabase ダッシュボード: https://supabase.com/dashboard
- SQL エディタ: https://supabase.com/dashboard/project/wirkjfsgwikhenxejeah/sql
- テーブル管理: https://supabase.com/dashboard/project/wirkjfsgwikhenxejeah/editor
