import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { AttendancePage } from '@/pages/AttendancePage'
import { ApprovalPage } from '@/pages/ApprovalPage'
import { CheckInOutPage } from '@/pages/CheckInOutPage'
import { CorrectionRequestPage } from '@/pages/CorrectionRequestPage'
import { LeaveManagementPage } from '@/pages/LeaveManagementPage'
import { AccountSettingsPage } from '@/pages/AccountSettingsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/signup',
      element: <SignupPage />,
    },
    {
      path: '/',
      element: <AppLayout />,
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
          path: 'leaves',
          element: <LeaveManagementPage />,
        },
        {
          path: 'profile',
          element: <ProfilePage />,
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
  ],
  {
    // React Router v7 Future Flag: startTransition を有効化
    // v7 への移行をスムーズに、Concurrent Features に対応
    future: {
      v7_startTransition: true,
    },
  }
)
