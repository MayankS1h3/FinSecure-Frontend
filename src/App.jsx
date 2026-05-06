import { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthContext } from './auth/AuthContext'
import RequireAuth from './auth/RequireAuth'
import AppShell from './components/layout/AppShell'
import { ROLES } from './utils/roles'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard'
import ManagerDashboard from './pages/dashboard/ManagerDashboard'
import HRDashboard from './pages/dashboard/HRDashboard'
import FinanceDashboard from './pages/dashboard/FinanceDashboard'
import AttendancePage from './pages/attendance/AttendancePage'
import TeamAttendancePage from './pages/attendance/TeamAttendancePage'
import MyLeavesPage from './pages/leaves/MyLeavesPage'
import PendingLeavesPage from './pages/leaves/PendingLeavesPage'
import MyTimesheetPage from './pages/timesheets/MyTimesheetPage'
import TeamTimesheetsPage from './pages/timesheets/TeamTimesheetsPage'
import TimesheetEntriesPage from './pages/timesheet-entries/TimesheetEntriesPage'
import WeeklyTimesheetEntryPage from './pages/timesheet-entries/WeeklyTimesheetEntryPage'
import HolidaysPage from './pages/holidays/HolidaysPage'
import RegularizationPage from './pages/regularization/RegularizationPage'
import SystemConfigurationPage from './pages/system-configuration/SystemConfigurationPage'
import NotFound from './pages/NotFound'

const DashboardRouter = () => {
  const { user } = useContext(AuthContext)

  switch (user?.role) {
    case ROLES.MANAGER:
      return <ManagerDashboard />
    case ROLES.HR:
      return <HRDashboard />
    case ROLES.FINANCE:
      return <FinanceDashboard />
    case ROLES.EMPLOYEE:
    default:
      return <EmployeeDashboard />
  }
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardRouter />} />
          <Route
            element={<RequireAuth roles={[ROLES.EMPLOYEE, ROLES.MANAGER]} />}
          >
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="regularization" element={<RegularizationPage />} />
            <Route path="leaves" element={<MyLeavesPage />} />
            <Route path="timesheets" element={<MyTimesheetPage />} />
            <Route path="timesheet-entries" element={<TimesheetEntriesPage />} />
            <Route path="leave-balance" element={<Navigate to="/leaves" replace />} />
          </Route>
          <Route element={<RequireAuth roles={[ROLES.EMPLOYEE]} />}>
            <Route
              path="timesheet-entries/weekly"
              element={<WeeklyTimesheetEntryPage />}
            />
          </Route>
          <Route element={<RequireAuth roles={[ROLES.MANAGER]} />}>
            <Route path="attendance/team" element={<TeamAttendancePage />} />
            <Route path="leaves/pending" element={<PendingLeavesPage />} />
            <Route path="timesheets/team" element={<TeamTimesheetsPage />} />
            <Route
              path="timesheets/pending"
              element={<Navigate to="/timesheets/team" replace />}
            />
            <Route
              path="timesheets/discrepancy"
              element={<Navigate to="/timesheets/team" replace />}
            />
            <Route path="leave-balance/team" element={<Navigate to="/leaves" replace />} />
          </Route>
          <Route
            element={
              <RequireAuth
                roles={[ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.HR, ROLES.FINANCE]}
              />
            }
          >
            <Route path="holidays" element={<HolidaysPage />} />
          </Route>
          <Route element={<RequireAuth roles={[ROLES.ADMIN]} />}>
            <Route
              path="system-configuration"
              element={<SystemConfigurationPage />}
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
