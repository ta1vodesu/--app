# 勤怠管理アプリ開発ガイド

## プロジェクト概要

紙やカード管理から脱却し、デジタルで勤怠を一元管理するSaaS型アプリケーション。企業の事務部門が簡単に従業員の勤怠記録を管理できることを目指す。

**ターゲット**: 企業の事務部門（管理者・マネージャー）と従業員

---

## UI/UXビジョン

### レイアウト構成

```
┌─────────────────────────────────────────────────────┐
│ ヘッダー（ブランド名 + ユーザー情報）                │
├─────────┬───────────────────────────────────────────┤
│ サイド  │ メインコンテンツ領域                        │
│ バー    │（タブの内容を表示）                        │
│ 1/3     │                                            │
│         │                                            │
│         │                                            │
│ メニュー│                                            │
│ リスト  │                                            │
│         │                                            │
└─────────┴───────────────────────────────────────────┘
```

### デザイン原則

| 項目 | 仕様 |
|------|------|
| **配色** | 青 × 白 |
| **プライマリ** | #1E40AF (紺青) |
| **セカンダリ** | #DBEAFE (淡青) |
| **アクセント** | #10B981 (承認・成功), #EF4444 (却下・警告) |
| **背景** | #FFFFFF (白), #F3F4F6 (薄灰) |
| **テキスト** | #1F2937 (濃灰) |
| **フォント** | Noto Sans JP, Segoe UI, 游ゴシック（企業用途対応） |
| **フォントウェイト** | Regular(400) / SemiBold(600) / Bold(700) |

### 視覚的階層

- **大型数値**: 24-32px Bold（KPI指標）
- **大見出し**: 20px SemiBold（ページタイトル）
- **中見出し**: 16px SemiBold（セクションタイトル）
- **本文**: 14px Regular（データ表示）
- **小テキスト**: 12px Regular（サブテキスト・補足）

---

## ユーザー分類別機能

### 1. 従業員（Employee）

**主要タブ**:
- **勤怠一覧**: 月単位で出勤日時・勤務時間・ステータスを表示
- **修正申請**: 打刻誤りの修正をリクエスト
- **プロフィール**: 個人情報・設定

**権限**:
- 自分の勤怠記録の確認
- 修正申請の作成
- 申請ステータスの確認

### 2. マネージャー（Manager）

**主要タブ**:
- **ダッシュボード**: 部署全体のKPI表示
  - 出勤率
  - 平均勤務時間
  - 承認待ち件数
  - 今月残業時間
  - 部署メンバー勤怠状況表（テーブル）
- **部署メンバー勤怠**: スタッフ個別の勤怠確認
- **承認待ち**: 修正申請の確認・承認・却下
- **設定**: 部署設定・権限管理

**権限**:
- 部署メンバーの勤怠確認
- 修正申請の承認・却下
- 部署レベルのレポート閲覧

### 3. 管理者（Admin）

**主要タブ**:
- **全体ダッシュボード**: 全社のKPI
- **ユーザー管理**: 従業員・マネージャー・管理者の追加・削除・権限変更
- **部署管理**: 部署の作成・編集・削除
- **システム設定**: 勤務時間設定・給休管理・ポリシー設定
- **監査ログ**: 全操作の履歴確認

**権限**:
- 全ユーザー・部署・システムの管理
- 承認申請の最終確認
- レポート生成・エクスポート

---

## 構成ファイル体系

```
勤怠管理-app/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── assets/
│       ├── logo.svg
│       ├── icons/
│       └── images/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MainContent.tsx
│   │   │   └── Layout.tsx
│   │   ├── Common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── Toast.tsx
│   │   ├── Dashboard/
│   │   │   ├── KPICard.tsx
│   │   │   ├── MemberStatusTable.tsx
│   │   │   ├── ManagerDashboard.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── Attendance/
│   │   │   ├── AttendanceList.tsx
│   │   │   ├── AttendanceRow.tsx
│   │   │   ├── DateNavigator.tsx
│   │   │   └── AttendanceDetail.tsx
│   │   ├── Requests/
│   │   │   ├── CorrectionRequestList.tsx
│   │   │   ├── CorrectionRequestForm.tsx
│   │   │   ├── ApprovalList.tsx
│   │   │   └── ApprovalModal.tsx
│   │   └── Settings/
│   │       ├── ProfileSettings.tsx
│   │       ├── DepartmentSettings.tsx
│   │       ├── UserManagement.tsx
│   │       └── SystemSettings.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── AttendancePage.tsx
│   │   ├── CorrectionPage.tsx
│   │   ├── ApprovalPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── 404Page.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useAttendance.ts
│   │   ├── useCorrectionRequest.ts
│   │   ├── useApproval.ts
│   │   └── usePagination.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── attendanceService.ts
│   │   ├── correctionService.ts
│   │   ├── approvalService.ts
│   │   └── userService.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── user.ts
│   │   ├── attendance.ts
│   │   ├── request.ts
│   │   └── api.ts
│   ├── utils/
│   │   ├── dateHelper.ts
│   │   ├── timeHelper.ts
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── styles/
│   │   ├── global.css
│   │   ├── variables.css
│   │   ├── components.css
│   │   └── responsive.css
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── NotificationContext.tsx
│   │   └── ThemeContext.tsx
│   ├── App.tsx
│   └── main.tsx
├── server/
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── validation.ts
│   │   │   └── errorHandler.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── attendance.ts
│   │   │   ├── correction.ts
│   │   │   ├── approval.ts
│   │   │   ├── users.ts
│   │   │   ├── departments.ts
│   │   │   └── reports.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── attendanceController.ts
│   │   │   ├── correctionController.ts
│   │   │   ├── approvalController.ts
│   │   │   ├── userController.ts
│   │   │   └── departmentController.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── attendanceService.ts
│   │   │   ├── correctionService.ts
│   │   │   ├── approvalService.ts
│   │   │   ├── userService.ts
│   │   │   └── departmentService.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Attendance.ts
│   │   │   ├── CorrectionRequest.ts
│   │   │   ├── Approval.ts
│   │   │   └── Department.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── app.ts
│   ├── database/
│   │   ├── schema.sql
│   │   ├── migrations/
│   │   └── seeds/
│   └── server.ts
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── services/
│   ├── integration/
│   │   ├── api/
│   │   └── database/
│   └── e2e/
│       ├── attendance.spec.ts
│       ├── correction.spec.ts
│       ├── approval.spec.ts
│       └── auth.spec.ts
├── .env.example
├── .env.local (Git Ignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── CLAUDE.md
└── README.md
```

---

## 開発ワークフロー

### 1. 機能実装フロー

```
1. 要件定義 → 2. テスト先行（TDD） → 3. 実装 → 4. コードレビュー
   ↓
5. セキュリティレビュー → 6. 統合テスト → 7. E2Eテスト → 8. デプロイ
```

### 2. TDD実装手順

1. **テスト作成（RED）**: 失敗するテストを先に書く
2. **実装（GREEN）**: テストを通すために最小限の実装
3. **リファクタリング（IMPROVE）**: コード品質を向上
4. **カバレッジ確認**: 80%以上を目指す

### 3. コードレビュー対象

- **CRITICAL**: セキュリティ脆弱性・データ損失リスク・本番障害 → 必ず修正
- **HIGH**: パフォーマンス低下・大型バグ・保守性低下 → 修正推奨
- **MEDIUM**: コーディング規約・軽度の問題 → 可能なら修正
- **LOW**: 細かい提案・最適化案 → 参考情報

### 4. 提出前チェックリスト

- [ ] テスト作成（カバレッジ80%以上）
- [ ] TypeScript型チェック通過
- [ ] Prettier自動フォーマット済み
- [ ] ESLint・stylelint通過
- [ ] console.log削除
- [ ] ハードコード値なし
- [ ] セキュリティレビュー完了
- [ ] E2Eテスト実行（必要に応じて）
- [ ] コードレビュー承認
- [ ] commit メッセージ規約準拠

---

## 技術スタック

| 層 | 技術 |
|------|------|
| **フロントエンド** | React 18 + TypeScript + Vite |
| **UI/UX** | Tailwind CSS + Radix UI |
| **状態管理** | React Context / Zustand |
| **API通信** | Axios / Fetch |
| **フォーム** | React Hook Form + Zod |
| **バックエンド** | Node.js + Express.js |
| **DB** | PostgreSQL / MySQL |
| **認証** | JWT + bcrypt |
| **テスト** | Vitest + React Testing Library + Playwright |
| **CI/CD** | GitHub Actions |

---

## セキュリティガイドライン

### 必須実装項目

- [ ] 入力値バリデーション（Zod使用）
- [ ] XSS対策（コンテンツのサニタイゼーション）
- [ ] CSRF対策（トークン検証）
- [ ] SQL Injection対策（Parameterized Queries）
- [ ] 認証・認可の実装
- [ ] API Rate Limiting
- [ ] エラーメッセージから機密情報非表示
- [ ] 環境変数での機密管理（API KEY等）
- [ ] HTTPS通信の強制
- [ ] パスワードハッシュ化（bcrypt）

### コミット前セキュリティチェック

```bash
# シークレット検出
grep -r "password\|API_KEY\|secret" src/ --exclude-dir=node_modules

# 依存関係脆弱性チェック
npm audit
```

---

## カラーシステム

```css
/* プライマリカラー */
--color-primary-900: #0c2340;      /* 最濃 */
--color-primary-800: #1024d0;
--color-primary-700: #1e40af;      /* メイン */
--color-primary-600: #2563eb;
--color-primary-500: #3b82f6;
--color-primary-400: #60a5fa;
--color-primary-300: #93c5fd;
--color-primary-200: #bfdbfe;
--color-primary-100: #dbeafe;      /* 最淡 */

/* ステータスカラー */
--color-success: #10b981;           /* 承認・成功 */
--color-pending: #f59e0b;           /* 待機中 */
--color-error: #ef4444;             /* 却下・エラー */
--color-info: #3b82f6;              /* 情報 */

/* グレースケール */
--color-gray-900: #111827;
--color-gray-700: #374151;
--color-gray-600: #4b5563;
--color-gray-500: #6b7280;
--color-gray-400: #9ca3af;
--color-gray-300: #d1d5db;
--color-gray-200: #e5e7eb;
--color-gray-100: #f3f4f6;
--color-white: #ffffff;
```

---

## APIエンドポイント設計

```
# 認証
POST   /api/auth/login              ログイン
POST   /api/auth/logout             ログアウト
POST   /api/auth/refresh            トークン更新
GET    /api/auth/me                 現在ユーザー情報

# 勤怠
GET    /api/attendance              勤怠一覧（月単位）
POST   /api/attendance/checkin      出勤打刻
POST   /api/attendance/checkout     退勤打刻
GET    /api/attendance/:id          勤怠詳細
PUT    /api/attendance/:id          勤怠編集

# 修正申請
GET    /api/corrections             修正申請一覧
POST   /api/corrections             修正申請作成
GET    /api/corrections/:id         修正申請詳細
PUT    /api/corrections/:id         修正申請編集

# 承認
GET    /api/approvals               承認待ち一覧
PATCH  /api/approvals/:id/approve   承認
PATCH  /api/approvals/:id/reject    却下

# ユーザー・部署
GET    /api/users                   ユーザー一覧
POST   /api/users                   ユーザー作成
GET    /api/departments             部署一覧
POST   /api/departments             部署作成

# レポート
GET    /api/reports/summary         月次サマリー
GET    /api/reports/export          データエクスポート
```

---

## パフォーマンス目標

| 指標 | 目標 |
|------|------|
| **ページ読み込み** | < 2s |
| **API応答時間** | < 500ms |
| **バンドルサイズ** | < 300KB |
| **Lighthouse スコア** | 90以上 |
| **CoreWeb Vitals** | Good以上 |

---

## ローカル開発環境セットアップ

```bash
# リポジトリクローン
git clone <repo-url>
cd 勤怠管理-app

# 依存インストール
npm install

# 環境変数設定
cp .env.example .env.local
# .env.localを編集

# DBマイグレーション
npm run db:migrate

# 開発サーバー起動
npm run dev

# テスト実行
npm run test

# E2Eテスト
npm run test:e2e

# ビルド
npm run build
```

---

## 更新ログ

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2026-07-12 | v0.1.0 | 初版作成：要件定義・設計・フォルダ構成定義 |
