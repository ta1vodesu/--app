# 勤怠管理アプリ - プロジェクトローカル情報

## プロジェクト進捗

**開始日**: 2026-07-12  
**ステータス**: 要件定義・設計フェーズ  
**次ステップ**: 開発環境構築 → プロトタイプ実装

---

## ビジュアルデザイン確定事項

### スクリーンショット参照

3つのメインページレイアウトが確定：

1. **マネージャー向けダッシュボード** (dashboard-manager.png)
   - KPIカード（出勤率96.2%、平均勤務時間8h12m、承認待ち3件、残業12.5h）
   - 部署メンバー勤怠状況テーブル

2. **従業員向け勤怠一覧** (attendance-list.png)
   - 月単位で日付・出勤・退勤・勤務時間・ステータス・操作を表示
   - 日付ナビゲーター（前月/翌月ボタン）
   - 修正申請リンク

3. **管理者向け承認待ち一覧** (approval-list.png)
   - 申請者・対象日・変更内容・理由・ステータス・操作ボタン
   - 承認/却下ボタン

### デザインシステム

**配色確定**:
- プライマリ: 青（#1E40AF）
- サポート: 白（背景）
- ステータス: 緑（承認）、オレンジ（待機）、赤（却下）、グレー（休日）

**フォント**: 企業向け日本語フォント（Noto Sans JPなど）

**レイアウト**: 2カラム（左1/3メニュー、右2/3コンテンツ）

---

## ユーザーロール別機能確定

### ロール定義

| ロール | メインユーザー | 主要機能 | 権限 |
|--------|----------------|---------|------|
| **Employee** | 従業員 | 勤怠確認・修正申請 | 自分の勤怠のみ |
| **Manager** | 部長・課長 | ダッシュボード・部署管理・承認 | 部署内のみ |
| **Admin** | システム管理者 | 全体管理・ユーザー管理・監査 | すべて |

### ロール別タブ一覧

**Employee**:
- 勤怠一覧
- 修正申請
- プロフィール

**Manager**:
- ダッシュボード（部署KPI）
- 部署メンバー勤怠
- 承認待ち
- 設定

**Admin**:
- 全体ダッシュボード
- ユーザー管理
- 部署管理
- システム設定
- 監査ログ

---

## API設計方針

- **認可スコープ**: ユーザーロール + リソースオーナーシップで制御
- **エラー処理**: 統一ApiResponse形式で返す
- **ページング**: limit, page, total で管理
- **タイムスタンプ**: ISO 8601形式（UTC）

---

## データベーススキーマ概要

**テーブル候補**:
- `users` (id, email, name, role, departmentId)
- `departments` (id, name, managerId)
- `attendances` (id, userId, date, checkInTime, checkOutTime, status)
- `corrections` (id, userId, attendanceId, reason, status)
- `approvals` (id, correctionId, approverId, status, note)

---

## セキュリティチェックリスト

- [ ] JWT認証実装
- [ ] ロールベースアクセス制御（RBAC）
- [ ] パスワードハッシュ化（bcrypt）
- [ ] SQL Injection対策
- [ ] XSS対策（React自動エスケープ）
- [ ] CSRF対策（トークン検証）
- [ ] Rate Limiting
- [ ] エラーメッセージから機密情報隠蔽
- [ ] 環境変数での秘密管理

---

## 注意事項

### 破壊的変更なし

このプロジェクトは初期段階のため、全ファイル・構造が変わる可能性あり。

### 命名規則

- ファイル: PascalCase（コンポーネント）、camelCase（ユーティリティ）
- 変数: camelCase
- 定数: UPPER_SNAKE_CASE
- データベースカラム: snake_case

### コーディングスタイル

- React: Functional Components + TypeScript
- 状態管理: React Context / Zustand
- スタイル: Tailwind CSS + CSS Modules
- テスト: Vitest + React Testing Library + Playwright

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-07-12 | 初期設定・CLAUDE.md・PROJECT_TEMPLATES.md作成 |
