import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '@/components/router/ProtectedRoute'
import { GuestRoute } from '@/components/router/GuestRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { AttendancePage } from '@/pages/AttendancePage'
import { ApprovalPage } from '@/pages/ApprovalPage'
import { CheckInOutPage } from '@/pages/CheckInOutPage'
import { CorrectionRequestPage } from '@/pages/CorrectionRequestPage'
import { MonthlyReportPage } from '@/pages/MonthlyReportPage'
import { AccountSettingsPage } from '@/pages/AccountSettingsPage'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: (
        <GuestRoute>
          <LoginPage />
        </GuestRoute>
      ),
    },
    {
      path: '/signup',
      element: (
        <GuestRoute>
          <SignupPage />
        </GuestRoute>
      ),
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      ),
      errorElement: <NotFoundPage />,
      children: [
        {
          index: true,
          element: <DashboardPage />,
        },
        {
          path: 'checkin',
          element: <CheckInOutPage />,
        },
        {
          path: 'attendance',
          element: <AttendancePage />,
        },
        {
          path: 'correction',
          element: <CorrectionRequestPage />,
        },
        {
          path: 'approvals',
          element: <ApprovalPage />,
        },
        {
          path: 'report',
          element: <MonthlyReportPage />,
        },
        {
          path: 'account-settings',
          element: <AccountSettingsPage />,
        },
      ],
    },
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ]
)
