import { useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import { getTeamDailyReport } from '../../api/attendance'
import { getPendingLeaves } from '../../api/leaves'
import { getPendingTimesheets } from '../../api/timesheets'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'

const ManagerDashboard = () => {
  const { token } = useContext(AuthContext)
  const [pendingLeaves, setPendingLeaves] = useState('0')
  const [pendingTimesheets, setPendingTimesheets] = useState('0')
  const [teamMissedPunches, setTeamMissedPunches] = useState('0')
  const [error, setError] = useState('')

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), [])

  useEffect(() => {
    const loadDashboard = async () => {
      setError('')

      const [leavesResult, timesheetsResult, teamReportResult] =
        await Promise.allSettled([
          getPendingLeaves(token, { page: 0, size: 1 }),
          getPendingTimesheets(token, { page: 0, size: 1 }),
          getTeamDailyReport(token, { date: todayIso }),
        ])

      if (leavesResult.status === 'fulfilled') {
        const data = leavesResult.value
        const total =
          typeof data?.totalElements === 'number'
            ? data.totalElements
            : Array.isArray(data)
              ? data.length
              : Array.isArray(data?.content)
                ? data.content.length
                : 0
        setPendingLeaves(String(total))
      } else {
        setPendingLeaves('0')
        setError((prev) => prev || 'Some dashboard values could not be loaded.')
      }

      if (timesheetsResult.status === 'fulfilled') {
        const data = timesheetsResult.value
        const total =
          typeof data?.totalElements === 'number'
            ? data.totalElements
            : Array.isArray(data)
              ? data.length
              : Array.isArray(data?.content)
                ? data.content.length
                : 0
        setPendingTimesheets(String(total))
      } else {
        setPendingTimesheets('0')
        setError((prev) => prev || 'Some dashboard values could not be loaded.')
      }

      if (teamReportResult.status === 'fulfilled') {
        const rows = Array.isArray(teamReportResult.value)
          ? teamReportResult.value
          : []
        const missed = rows.filter((row) => row?.status === 'MISS_SWIPE').length
        setTeamMissedPunches(String(missed))
      } else {
        setTeamMissedPunches('0')
        setError((prev) => prev || 'Some dashboard values could not be loaded.')
      }
    }

    loadDashboard()
  }, [token, todayIso])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Manager Control Room"
        subtitle="Review approvals, track team attendance, and monitor compliance."
      />
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
        <StatCard label="Pending Leaves" value={pendingLeaves} />
        <StatCard label="Pending Timesheets" value={pendingTimesheets} />
        <StatCard label="Team Missed Punches" value={teamMissedPunches} />
      </div>
      {error && <p className="text-orange-700">{error}</p>}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        <Card>
          <h3>Approvals queue</h3>
          <p>Visit Pending Leaves or Pending Timesheets to approve requests.</p>
        </Card>
        <Card>
          <h3>Team reminders</h3>
          <p>Discrepancies are low this week. Keep monitoring daily reports.</p>
        </Card>
      </div>
    </div>
  )
}

export default ManagerDashboard
