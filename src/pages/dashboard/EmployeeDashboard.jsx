import { useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import { getAttendanceByDate } from '../../api/attendance'
import { getMyLeaves } from '../../api/leaves'
import { getMyTimesheet } from '../../api/timesheets'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const statusLabel = (status) => {
  if (!status) return 'Pending punch'
  return status.replace(/_/g, ' ')
}

const EmployeeDashboard = () => {
  const { token } = useContext(AuthContext)
  const [todayStatus, setTodayStatus] = useState('Pending punch')
  const [pendingLeaves, setPendingLeaves] = useState('0')
  const [timesheetValue, setTimesheetValue] = useState('-')
  const [error, setError] = useState('')

  const now = useMemo(() => new Date(), [])
  const currentMonth = String(now.getMonth() + 1)
  const currentYear = String(now.getFullYear())
  const todayIso = now.toISOString().slice(0, 10)

  useEffect(() => {
    const loadDashboard = async () => {
      setError('')

      const [attendanceResult, leavesResult, timesheetResult] =
        await Promise.allSettled([
          getAttendanceByDate(token, todayIso),
          getMyLeaves(token, { status: 'PENDING', page: 0, size: 1 }),
          getMyTimesheet(token, { month: currentMonth, year: currentYear }),
        ])

      if (attendanceResult.status === 'fulfilled') {
        setTodayStatus(statusLabel(attendanceResult.value?.status))
      } else if (attendanceResult.reason?.status === 404) {
        setTodayStatus('Pending punch')
      } else {
        setTodayStatus('Unavailable')
        setError((prev) => prev || 'Some dashboard values could not be loaded.')
      }

      if (leavesResult.status === 'fulfilled') {
        const leavesData = leavesResult.value
        const count =
          typeof leavesData?.totalElements === 'number'
            ? leavesData.totalElements
            : Array.isArray(leavesData)
              ? leavesData.length
              : Array.isArray(leavesData?.content)
                ? leavesData.content.length
                : 0
        setPendingLeaves(String(count))
      } else {
        setPendingLeaves('0')
        setError((prev) => prev || 'Some dashboard values could not be loaded.')
      }

      if (timesheetResult.status === 'fulfilled') {
        const timesheet = timesheetResult.value
        if (!timesheet?.status) {
          setTimesheetValue('-')
        } else if (timesheet.status === 'DRAFT') {
          const monthIndex = Number(timesheet.month || currentMonth) - 1
          const monthLabel = MONTH_NAMES[monthIndex] || 'Draft'
          setTimesheetValue(`${monthLabel} Draft`)
        } else {
          setTimesheetValue(statusLabel(timesheet.status))
        }
      } else {
        setTimesheetValue('-')
        setError((prev) => prev || 'Some dashboard values could not be loaded.')
      }
    }

    loadDashboard()
  }, [token, todayIso, currentMonth, currentYear])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Employee Snapshot"
        subtitle="Track your attendance health, leave balance, and timesheet cadence."
      />
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
        <StatCard label="Today's Status" value={todayStatus} />
        <StatCard label="Leaves Pending" value={pendingLeaves} />
        <StatCard label="Timesheet" value={timesheetValue} />
      </div>
      {error && <p className="text-orange-700">{error}</p>}
    </div>
  )
}

export default EmployeeDashboard
