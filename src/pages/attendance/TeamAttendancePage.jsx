import { useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import {
  getEmployeeAttendance,
  getEmployeeMonthlyReport,
  getTeamDailyReport,
} from '../../api/attendance'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Pagination from '../../components/ui/Pagination'
import StatCard from '../../components/ui/StatCard'
import { formatDate } from '../../utils/format'

const MONTH_OPTIONS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

const formatWorked = (row) => {
  if (row?.formattedTotalHoursWorked) return row.formattedTotalHoursWorked
  if (typeof row?.totalMinutesWorked === 'number') {
    return `${(row.totalMinutesWorked / 60).toFixed(2)} hrs`
  }
  return '-'
}

const TeamAttendancePage = () => {
  const { token } = useContext(AuthContext)
  const now = new Date()
  const [date, setDate] = useState(() => now.toISOString().slice(0, 10))
  const [rows, setRows] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [employeeId, setEmployeeId] = useState('')
  const [month, setMonth] = useState(String(now.getMonth() + 1))
  const [year, setYear] = useState(String(now.getFullYear()))
  const [monthlyReport, setMonthlyReport] = useState(null)
  const [employeeAttendance, setEmployeeAttendance] = useState([])
  const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 0 })
  const [dailyError, setDailyError] = useState('')
  const [monthlyError, setMonthlyError] = useState('')
  const [loadingDaily, setLoadingDaily] = useState(false)
  const [loadingMonthly, setLoadingMonthly] = useState(false)

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear()
    const start = 2000
    const end = current + 5
    return Array.from({ length: end - start + 1 }, (_, index) =>
      String(start + index),
    )
  }, [])

  useEffect(() => {
    const loadDaily = async () => {
      setLoadingDaily(true)
      setDailyError('')
      try {
        const data = await getTeamDailyReport(token, { date })
        const list = Array.isArray(data) ? data : []
        setRows(list)

        const members = list
          .filter((row) => row?.employeeId)
          .map((row) => ({
            id: String(row.employeeId),
            label: `${row.employeeName || 'Employee'} ${row.employeeId}`,
          }))
          .filter(
            (member, index, arr) =>
              arr.findIndex((item) => item.id === member.id) === index,
          )

        setTeamMembers(members)
        setEmployeeId((prev) => {
          if (prev && members.some((member) => member.id === prev)) return prev
          return members[0]?.id || ''
        })
      } catch (err) {
        setRows([])
        setTeamMembers([])
        setEmployeeId('')
        setDailyError(err.message || 'Unable to load team report')
      } finally {
        setLoadingDaily(false)
      }
    }

    loadDaily()
  }, [token, date])

  useEffect(() => {
    const loadMonthly = async () => {
      if (!employeeId) {
        setMonthlyReport(null)
        setEmployeeAttendance([])
        setPageInfo({ page: 0, totalPages: 0 })
        return
      }

      setLoadingMonthly(true)
      setMonthlyError('')

      const employeeIdNum = Number(employeeId)
      const [reportResult, attendanceResult] = await Promise.allSettled([
        getEmployeeMonthlyReport(token, employeeIdNum, { month, year }),
        getEmployeeAttendance(token, employeeIdNum, {
          month,
          year,
          page: pageInfo.page,
          size: 10,
        }),
      ])

      if (reportResult.status === 'fulfilled') {
        setMonthlyReport(reportResult.value || null)
      } else {
        setMonthlyReport(null)
        setMonthlyError(
          reportResult.reason?.message || 'Unable to load monthly report',
        )
      }

      if (attendanceResult.status === 'fulfilled') {
        const data = attendanceResult.value
        const list = Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data)
            ? data
            : []
        setEmployeeAttendance(list)
        setPageInfo((prev) => ({
          page: typeof data?.number === 'number' ? data.number : prev.page,
          totalPages:
            typeof data?.totalPages === 'number'
              ? data.totalPages
              : list.length > 0
                ? 1
                : 0,
        }))
      } else {
        setEmployeeAttendance([])
        setPageInfo((prev) => ({ ...prev, totalPages: 0 }))
        setMonthlyError((prev) =>
          prev || attendanceResult.reason?.message || 'Unable to load attendance',
        )
      }

      setLoadingMonthly(false)
    }

    loadMonthly()
  }, [token, employeeId, month, year, pageInfo.page])

  const handleMemberChange = (event) => {
    setEmployeeId(event.target.value)
    setPageInfo((prev) => ({ ...prev, page: 0 }))
  }

  const handleMonthChange = (event) => {
    setMonth(event.target.value)
    setPageInfo((prev) => ({ ...prev, page: 0 }))
  }

  const handleYearChange = (event) => {
    setYear(event.target.value)
    setPageInfo((prev) => ({ ...prev, page: 0 }))
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Team Attendance"
        subtitle="Check daily team attendance and employee monthly reports."
        actions={
          <Input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        }
      />
      <Card>
        <h3>Team daily attendance</h3>
        {dailyError && <p className="text-orange-700">{dailyError}</p>}
        {loadingDaily ? (
          <p>Loading...</p>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No attendance data"
            description="Try another date to view the team report."
          />
        ) : (
          <Table columns={['Employee', 'Date', 'Punch In', 'Punch Out', 'Status', 'Hours']}>
            {rows.map((row) => (
              <tr key={`${row.employeeId}-${row.date}`}>
                <td>{row.employeeName || row.employeeId}</td>
                <td>{formatDate(row.date)}</td>
                <td>{row.punchInTime || '-'}</td>
                <td>{row.punchOutTime || '-'}</td>
                <td>{row.status}</td>
                <td>{formatWorked(row)}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Card>
        <h3>Employee monthly attendance filters</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={employeeId} onChange={handleMemberChange}>
            {teamMembers.length === 0 ? (
              <option value="">No team members</option>
            ) : (
              teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.label}
                </option>
              ))
            )}
          </Select>
          <Select value={month} onChange={handleMonthChange}>
            {MONTH_OPTIONS.map((optionMonth) => (
              <option key={optionMonth.value} value={optionMonth.value}>
                {optionMonth.label}
              </option>
            ))}
          </Select>
          <Select value={year} onChange={handleYearChange}>
            {yearOptions.map((optionYear) => (
              <option key={optionYear} value={optionYear}>
                {optionYear}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        <h3>Monthly summary</h3>
        {monthlyError && <p className="text-orange-700">{monthlyError}</p>}
        {employeeId && monthlyReport ? (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
            <StatCard
              label="Present days"
              value={monthlyReport.presentDays ?? '-'}
            />
            <StatCard
              label="Half days"
              value={monthlyReport.halfDayCount ?? '-'}
            />
            <StatCard
              label="Absent days"
              value={monthlyReport.absentDays ?? '-'}
            />
            <StatCard
              label="Late count"
              value={monthlyReport.lateCount ?? '-'}
            />
            <StatCard
              label="Total hours"
              value={
                typeof monthlyReport.totalHoursWorked === 'number'
                  ? monthlyReport.totalHoursWorked.toFixed(2)
                  : '-'
              }
            />
          </div>
        ) : (
          <EmptyState
            title="No monthly report"
            description="Select a team member, month, and year to view report."
          />
        )}
      </Card>

      <Card>
        <h3>Employee monthly attendance (paged)</h3>
        {loadingMonthly ? (
          <p>Loading...</p>
        ) : employeeAttendance.length === 0 ? (
          <EmptyState
            title="No attendance records"
            description="Try a different filter selection."
          />
        ) : (
          <>
            <Table
              columns={[
                'Date',
                'Punch In',
                'Punch Out',
                'Worked',
                'Status',
                'Late',
                'Regularized',
              ]}
            >
              {employeeAttendance.map((row) => (
                <tr key={row.attendanceId || row.date}>
                  <td>{formatDate(row.date)}</td>
                  <td>{row.punchInTime || '-'}</td>
                  <td>{row.punchOutTime || '-'}</td>
                  <td>{formatWorked(row)}</td>
                  <td>{row.status || '-'}</td>
                  <td>{row.isLate ? 'Yes' : 'No'}</td>
                  <td>{row.isRegularized ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </Table>
            <Pagination
              page={pageInfo.page}
              totalPages={pageInfo.totalPages}
              onPageChange={(nextPage) =>
                setPageInfo((prev) => ({ ...prev, page: nextPage }))
              }
              showAlways
            />
          </>
        )}
      </Card>
    </div>
  )
}

export default TeamAttendancePage
