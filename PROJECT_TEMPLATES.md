# プロジェクト構成テンプレート集

各種ファイル実装の基本テンプレート。プロジェクト開始時に参照してください。

---

## 1. React コンポーネント テンプレート

### 基本コンポーネント（Functional Component）

```typescript
// src/components/Example/ExampleComponent.tsx

import React from 'react'
import styles from './ExampleComponent.module.css'

interface ExampleComponentProps {
  title: string
  description?: string
  onAction?: () => void
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({
  title,
  description,
  onAction
}) => {
  const handleClick = () => {
    onAction?.()
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      <button onClick={handleClick} className={styles.button}>
        実行
      </button>
    </div>
  )
}

ExampleComponent.displayName = 'ExampleComponent'
```

### フォームコンポーネント（React Hook Form）

```typescript
// src/components/Forms/AttendanceForm.tsx

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../Common/Button'
import { FormInput } from '../Common/FormInput'

const attendanceSchema = z.object({
  date: z.string().min(1, '日付は必須です'),
  checkInTime: z.string().min(1, '出勤時刻は必須です'),
  checkOutTime: z.string().optional(),
  workingHours: z.string().optional()
})

type AttendanceFormData = z.infer<typeof attendanceSchema>

interface AttendanceFormProps {
  initialData?: Partial<AttendanceFormData>
  onSubmit: (data: AttendanceFormData) => Promise<void>
  isLoading?: boolean
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: initialData
  })

  const handleFormSubmit = async (data: AttendanceFormData) => {
    await onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <FormInput
        label="日付"
        type="date"
        {...register('date')}
        error={errors.date?.message}
      />
      <FormInput
        label="出勤時刻"
        type="time"
        {...register('checkInTime')}
        error={errors.checkInTime?.message}
      />
      <FormInput
        label="退勤時刻"
        type="time"
        {...register('checkOutTime')}
        error={errors.checkOutTime?.message}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? '送信中...' : '送信'}
      </Button>
    </form>
  )
}

AttendanceForm.displayName = 'AttendanceForm'
```

---

## 2. カスタムフック テンプレート

### useAuth フック

```typescript
// src/hooks/useAuth.ts

import { useState, useCallback, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

interface AuthState {
  isAuthenticated: boolean
  user: any | null
  isLoading: boolean
  error: string | null
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()

  const handleLogin = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [login])

  return { handleLogin, isLoading, error }
}
```

### useAttendance フック

```typescript
// src/hooks/useAttendance.ts

import { useState, useCallback, useEffect } from 'react'
import { attendanceService } from '../services/attendanceService'
import type { Attendance } from '../types/attendance'

export const useAttendance = (userId: string, year: number, month: number) => {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAttendances = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await attendanceService.getByMonth(userId, year, month)
      setAttendances(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データ取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [userId, year, month])

  useEffect(() => {
    fetchAttendances()
  }, [fetchAttendances])

  const updateAttendance = useCallback(async (id: string, data: Partial<Attendance>) => {
    try {
      const updated = await attendanceService.update(id, data)
      setAttendances(prev => prev.map(a => a.id === id ? updated : a))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : '更新に失敗しました')
    }
  }, [])

  return {
    attendances,
    isLoading,
    error,
    refetch: fetchAttendances,
    updateAttendance
  }
}
```

---

## 3. サービス層 テンプレート

### API Service

```typescript
// src/services/api.ts

import axios, { AxiosInstance, AxiosError } from 'axios'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('authToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    this.client.interceptors.response.use(
      response => response,
      error => this.handleError(error)
    )
  }

  private handleError(error: AxiosError) {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }

  get<T>(url: string, config = {}) {
    return this.client.get<T>(url, config)
  }

  post<T>(url: string, data?: any, config = {}) {
    return this.client.post<T>(url, data, config)
  }

  put<T>(url: string, data?: any, config = {}) {
    return this.client.put<T>(url, data, config)
  }

  patch<T>(url: string, data?: any, config = {}) {
    return this.client.patch<T>(url, data, config)
  }

  delete<T>(url: string, config = {}) {
    return this.client.delete<T>(url, config)
  }
}

export const apiClient = new ApiClient()
```

### Attendance Service

```typescript
// src/services/attendanceService.ts

import { apiClient } from './api'
import type { Attendance } from '../types/attendance'

export const attendanceService = {
  getByMonth: async (userId: string, year: number, month: number): Promise<Attendance[]> => {
    const { data } = await apiClient.get(`/attendance`, {
      params: { userId, year, month }
    })
    return data
  },

  getById: async (id: string): Promise<Attendance> => {
    const { data } = await apiClient.get(`/attendance/${id}`)
    return data
  },

  create: async (payload: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>): Promise<Attendance> => {
    const { data } = await apiClient.post('/attendance', payload)
    return data
  },

  update: async (id: string, payload: Partial<Attendance>): Promise<Attendance> => {
    const { data } = await apiClient.put(`/attendance/${id}`, payload)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/attendance/${id}`)
  }
}
```

---

## 4. 型定義 テンプレート

### ユーザー型

```typescript
// src/types/user.ts

export enum UserRole {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  ADMIN = 'admin'
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  departmentId: string
  department?: Department
  createdAt: Date
  updatedAt: Date
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Department {
  id: string
  name: string
  managerId: string
  createdAt: Date
  updatedAt: Date
}
```

### 勤怠型

```typescript
// src/types/attendance.ts

export enum AttendanceStatus {
  WORKING = 'working',
  HOLIDAY = 'holiday',
  ABSENT = 'absent',
  PENDING = 'pending'
}

export interface Attendance {
  id: string
  userId: string
  date: Date
  checkInTime?: string
  checkOutTime?: string
  workingHours?: string
  status: AttendanceStatus
  createdAt: Date
  updatedAt: Date
}

export interface AttendanceSummary {
  totalWorkingDays: number
  totalWorkingHours: string
  averageWorkingHours: string
  attendanceRate: number
  overtimeHours: string
}
```

### リクエスト型

```typescript
// src/types/request.ts

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface CorrectionRequest {
  id: string
  userId: string
  attendanceId: string
  attendanceDate: Date
  originalCheckIn?: string
  correctedCheckIn?: string
  originalCheckOut?: string
  correctedCheckOut?: string
  reason: string
  status: RequestStatus
  createdAt: Date
  updatedAt: Date
  approvedAt?: Date
  approverNote?: string
}
```

---

## 5. API レスポンス型

```typescript
// src/types/api.ts

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  meta?: {
    total?: number
    page?: number
    limit?: number
    timestamp?: string
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export type ApiResult<T> = Promise<ApiResponse<T>>
```

---

## 6. CSSモジュール テンプレート

```css
/* src/components/Example/ExampleComponent.module.css */

.container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: var(--color-white);
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-gray-900);
}

.description {
  font-size: 0.875rem;
  color: var(--color-gray-600);
  line-height: 1.5;
}

.button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-white);
  background-color: var(--color-primary-600);
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.button:hover {
  background-color: var(--color-primary-700);
}

.button:disabled {
  background-color: var(--color-gray-400);
  cursor: not-allowed;
}

/* レスポンシブ */
@media (max-width: 640px) {
  .container {
    padding: 1rem;
    gap: 1rem;
  }

  .title {
    font-size: 1.25rem;
  }
}
```

---

## 7. ユーティリティ テンプレート

### 日時ヘルパー

```typescript
// src/utils/dateHelper.ts

export const dateHelper = {
  formatDate: (date: Date, format: string = 'YYYY-MM-DD'): string => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    
    if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`
    if (format === 'YYYY年MM月DD日') return `${year}年${month}月${day}日`
    return `${year}-${month}-${day}`
  },

  formatTime: (time: string): string => {
    return time.substring(0, 5)
  },

  getMonthRange: (year: number, month: number) => {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0)
    return { start, end }
  },

  isWeekend: (date: Date): boolean => {
    const day = date.getDay()
    return day === 0 || day === 6
  },

  addDays: (date: Date, days: number): Date => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }
}
```

### バリデーター

```typescript
// src/utils/validators.ts

export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  time: (time: string): boolean => {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  },

  workingHours: (hours: string): boolean => {
    const parts = hours.split(':')
    if (parts.length !== 2) return false
    const [h, m] = parts.map(Number)
    return !isNaN(h) && !isNaN(m) && h >= 0 && m >= 0 && m < 60
  },

  notEmpty: (value: string): boolean => {
    return value.trim().length > 0
  }
}
```

---

## 8. テスト テンプレート

### コンポーネントテスト

```typescript
// src/components/Example/__tests__/ExampleComponent.test.tsx

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExampleComponent } from '../ExampleComponent'

describe('ExampleComponent', () => {
  it('タイトルを表示する', () => {
    render(<ExampleComponent title="テストタイトル" />)
    expect(screen.getByText('テストタイトル')).toBeInTheDocument()
  })

  it('説明文を表示する', () => {
    render(
      <ExampleComponent
        title="テスト"
        description="説明文"
      />
    )
    expect(screen.getByText('説明文')).toBeInTheDocument()
  })

  it('ボタンクリック時にコールバックを実行する', async () => {
    const handleClick = vi.fn()
    render(
      <ExampleComponent
        title="テスト"
        onAction={handleClick}
      />
    )

    const button = screen.getByRole('button')
    await userEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('説明文がない場合は表示しない', () => {
    render(<ExampleComponent title="テスト" />)
    expect(screen.queryByText('説明文')).not.toBeInTheDocument()
  })
})
```

### フックテスト

```typescript
// src/hooks/__tests__/useAttendance.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAttendance } from '../useAttendance'
import * as attendanceService from '../../services/attendanceService'

vi.mock('../../services/attendanceService')

describe('useAttendance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('勤怠データを取得する', async () => {
    const mockData = [
      {
        id: '1',
        userId: 'user1',
        date: new Date('2026-07-01'),
        status: 'working'
      }
    ]

    vi.mocked(attendanceService.getByMonth).mockResolvedValue(mockData)

    const { result } = renderHook(() => useAttendance('user1', 2026, 7))

    await waitFor(() => {
      expect(result.current.attendances).toEqual(mockData)
    })
  })

  it('データ取得失敗時にエラーを設定する', async () => {
    vi.mocked(attendanceService.getByMonth).mockRejectedValue(
      new Error('API Error')
    )

    const { result } = renderHook(() => useAttendance('user1', 2026, 7))

    await waitFor(() => {
      expect(result.current.error).toBe('API Error')
    })
  })
})
```

---

## 9. ページコンポーネント テンプレート

```typescript
// src/pages/AttendancePage.tsx

import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useAttendance } from '../hooks/useAttendance'
import { Layout } from '../components/Layout/Layout'
import { AttendanceList } from '../components/Attendance/AttendanceList'
import { DateNavigator } from '../components/Attendance/DateNavigator'
import { Spinner } from '../components/Common/Spinner'
import { Toast } from '../components/Common/Toast'

export const AttendancePage: React.FC = () => {
  const { user } = useAuth()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { attendances, isLoading, error } = useAttendance(user?.id || '', year, month)

  const handlePreviousMonth = () => {
    if (month === 1) {
      setYear(year - 1)
      setMonth(12)
    } else {
      setMonth(month - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 12) {
      setYear(year + 1)
      setMonth(1)
    } else {
      setMonth(month + 1)
    }
  }

  if (error) {
    return (
      <Layout>
        <div className="error-message">エラーが発生しました: {error}</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="page-container">
        <h1>勤怠一覧</h1>

        <DateNavigator
          year={year}
          month={month}
          onPrevious={handlePreviousMonth}
          onNext={handleNextMonth}
        />

        {isLoading ? (
          <Spinner />
        ) : (
          <AttendanceList attendances={attendances} />
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </Layout>
  )
}

AttendancePage.displayName = 'AttendancePage'
```

---

## 10. 環境変数テンプレート

```bash
# .env.example

# API設定
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000

# 認証
VITE_AUTH_TOKEN_KEY=authToken
VITE_TOKEN_REFRESH_INTERVAL=3600000

# アプリケーション
VITE_APP_NAME=勤怠管理システム
VITE_APP_VERSION=0.1.0
VITE_LOG_LEVEL=info

# 開発環境のみ
VITE_ENABLE_MOCK_API=false
VITE_DEBUG_MODE=false
```

---

## チェックリスト：新機能実装時

- [ ] 型定義（types/）を先に作成
- [ ] テストファイルを作成（test が fail するように）
- [ ] コンポーネント/フックを実装
- [ ] テストが pass することを確認
- [ ] スタイル/CSSを調整
- [ ] Prettier/ESLint検証
- [ ] console.log削除
- [ ] ハードコード値なし確認
- [ ] コードレビュー依頼
- [ ] セキュリティレビュー
- [ ] E2Eテスト（必要に応じて）
- [ ] コミット・プッシュ
