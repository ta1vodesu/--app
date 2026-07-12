# Supabase統合 - 実装サマリー

## ✅ 実装内容

### 1. インストール
- `@supabase/supabase-js` をインストール済み

### 2. ファイル構造

```
src/
├── lib/
│   └── supabase.ts              # Supabase Client初期化
├── services/
│   ├── authService.ts           # 認証サービス
│   ├── attendanceService.ts     # 勤怠サービス
│   └── correctionService.ts     # 修正申請サービス
└── ...既存ファイル

database/
├── complete_setup.sql           # DB初期化スクリプト
├── schema.sql                   # スキーマ定義
└── seeds.sql                    # サンプルデータ

.env.example                      # 環境変数テンプレート
SUPABASE_SETUP.md                # セットアップガイド
SUPABASE_IMPLEMENTATION.md       # このファイル
```

### 3. 作成されたサービス

#### authService.ts
- `login(email, password)` - ログイン
- `signup(email, password, name)` - サインアップ
- `logout()` - ログアウト
- `getCurrentUser()` - 現在のユーザー取得
- `getSession()` - セッション取得

#### attendanceService.ts
- `getAttendances(userId, year, month)` - 勤怠一覧取得
- `checkIn(userId, workType)` - 出勤打刻
- `checkOut(attendanceId)` - 退勤打刻
- `addBreakTime(attendanceId, breakTimes)` - 休憩時間記録

#### correctionService.ts
- `getCorrectionRequests(userId)` - 修正申請一覧
- `createCorrectionRequest()` - 修正申請作成
- `getPendingRequests(managerId)` - 待機中の申請取得
- `approveRequest()` - 申請承認
- `rejectRequest()` - 申請却下

## 🚀 次のステップ

### Phase 1: セットアップ（必須）
- [ ] Supabaseプロジェクト作成
- [ ] `.env.local`に設定値を入力
- [ ] SQL Editorでデータベース初期化
- [ ] Authentication設定
- [ ] RLSポリシー設定

### Phase 2: ページ修正（推奨）
以下のページを順に修正して、ダミーデータをSupabase呼び出しに置き換え：

1. **LoginPage.tsx** - authService使用
2. **SignupPage.tsx** - authService使用
3. **CheckInOutPage.tsx** - attendanceService使用
4. **AttendancePage.tsx** - attendanceService使用
5. **ApprovalPage.tsx** - correctionService使用
6. **CorrectionRequestPage.tsx** - correctionService使用
7. **DashboardPage.tsx** - 複数サービス使用

### Phase 3: AuthContext統合（推奨）
`src/context/AuthContext.tsx`を作成：
- ユーザー認証状態を管理
- ルート保護を実装
- セッション自動リロード

## 📝 使用例

### ログイン
```typescript
import { authService } from '@/services/authService'

const handleLogin = async (email: string, password: string) => {
  try {
    const { user } = await authService.login(email, password)
    navigate('/')
  } catch (err) {
    setError(err.message)
  }
}
```

### 勤怠記録取得
```typescript
import { attendanceService } from '@/services/attendanceService'

useEffect(() => {
  const fetchAttendances = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const attendances = await attendanceService.getAttendances(
      user.id,
      2026,
      3
    )
    setAttendances(attendances)
  }
  
  fetchAttendances()
}, [selectedDate])
```

### 出勤打刻
```typescript
import { attendanceService } from '@/services/attendanceService'

const handleCheckIn = async (workType: string) => {
  const { data: { user } } = await supabase.auth.getUser()
  const attendance = await attendanceService.checkIn(user.id, workType)
  setCurrentAttendance(attendance)
}
```

## 🔒 セキュリティチェックリスト

- [ ] RLSポリシーが全テーブルに設定されている
- [ ] `.env.local`が`.gitignore`に含まれている
- [ ] ANON_KEYが適切にスコープされている
- [ ] パスワードは本番環境でハッシュ化される
- [ ] APIレート制限が設定されている
- [ ] エラーメッセージが機密情報を露出していない

## 💡 参考リンク

- [Supabase 公式ドキュメント](https://supabase.com/docs)
- [Supabase JavaScript クライアント](https://supabase.com/docs/reference/javascript)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL リファレンス](https://www.postgresql.jp/document/)

## ❓ よくある質問

**Q: ダミーデータはどうなる？**
A: ページを修正する際に、ダミーデータ参照を削除し、Supabaseの実データに置き換えます

**Q: 既存ユーザーのデータは？**
A: CSV エクスポート → Supabase インポート で移行できます

**Q: オフラインで使える？**
A: Supabase Realtimeの同期機能を使うと、オフライン対応が可能です

**Q: 本番環境の設定は？**
A: 環境変数を本番環境の値に変更し、RLSを厳格に設定してください
