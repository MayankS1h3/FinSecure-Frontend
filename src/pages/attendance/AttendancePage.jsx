import { useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import {
  getMyAttendance,
  getMyMonthlyReport,
  punchIn,
  punchOut,
} from '../../api/attendance'
import { getMyLeaves } from '../../api/leaves'
import { getHolidays } from '../../api/holidays'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import useQueryParams from '../../hooks/useQueryParams'
import { formatDate } from '../../utils/format'

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const CALENDAR_TONE_CLASSES = {
  present: 'border-green-700/35 bg-green-700/8',
  half: 'border-amber-700/35 bg-amber-700/8',
  miss: 'border-orange-700/35 bg-orange-700/8',
  absent: 'border-red-600/35 bg-red-600/8',
  leave: 'border-green-600/35 bg-green-600/8',
  holiday: 'border-sky-600/35 bg-sky-600/8',
  none: '',
}

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

const pad = (value) => String(value).padStart(2, '0')

const toDateKey = (year, month, day) => `${year}-${pad(month)}-${pad(day)}`

const statusLabel = (status) => {
  if (!status) return 'No record'
  return status.replace(/_/g, ' ')
}

const statusTone = (
  status,
  isOnLeave,
  isHoliday,
  isPastDate,
  isWeekend,
  attendanceLoaded,
) => {
  if (isOnLeave) return 'leave'
  if (isHoliday) return 'holiday'
  if (status === 'PRESENT' || status === 'MANUAL_PUNCH') return 'present'
  if (status === 'HALF_DAY_PRESENT') return 'half'
  if (status === 'ABSENT') return 'absent'
  if (status === 'MISS_SWIPE') return 'miss'
  if (attendanceLoaded && !status && isPastDate && !isWeekend) return 'absent'
  return 'none'
}

const workedLabel = (entry) => {
  if (!entry) return '-'
  if (entry.formattedTotalHoursWorked) return entry.formattedTotalHoursWorked
  if (typeof entry.totalMinutesWorked === 'number') {
    return `${(entry.totalMinutesWorked / 60).toFixed(2)} hrs`
  }
  return '-'
}

const AttendancePage = () => {
  const { token } = useContext(AuthContext)
  const { getParam, setParams } = useQueryParams()
  const [attendance, setAttendance] = useState([])
  const [report, setReport] = useState(null)
  const [approvedLeaves, setApprovedLeaves] = useState([])
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [punchLoading, setPunchLoading] = useState('')
  const [attendanceLoaded, setAttendanceLoaded] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [logOpen, setLogOpen] = useState(false)

  const month = getParam('month', String(new Date().getMonth() + 1))
  const year = getParam('year', String(new Date().getFullYear()))
  const numericMonth = Number(month)
  const numericYear = Number(year)
  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear()
    const start = 2000
    const end = current + 5
    return Array.from({ length: end - start + 1 }, (_, index) =>
      String(start + index),
    )
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    setAttendanceLoaded(false)
    try {
      const [attendanceData, reportData] = await Promise.all([
        getMyAttendance(token, { month, year }),
        getMyMonthlyReport(token, { month, year }),
      ])

      setAttendance(attendanceData || [])
      setReport(reportData)
      setAttendanceLoaded(true)

      const [leavesResult, holidaysResult] = await Promise.allSettled([
        getMyLeaves(token, {
          status: 'APPROVED',
          month,
          year,
          page: 0,
          size: 250,
        }),
        getHolidays(token, { year }),
      ])

      if (leavesResult.status === 'fulfilled') {
        const leavesData = leavesResult.value
        setApprovedLeaves(leavesData?.content || leavesData || [])
      } else {
        setApprovedLeaves([])
      }

      if (holidaysResult.status === 'fulfilled') {
        setHolidays(holidaysResult.value || [])
      } else {
        setHolidays([])
      }
    } catch (err) {
      setError(err.message || 'Unable to load attendance')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year])

  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(''), 2200)
    return () => clearTimeout(timer)
  }, [feedback])

  const handlePunch = async (action) => {
    setError('')
    setFeedback('')
    setPunchLoading(action)
    try {
      if (action === 'in') {
        await punchIn(token)
        setFeedback('Punch in successful. Attendance refreshed.')
      } else {
        await punchOut(token)
        setFeedback('Punch out successful. Attendance refreshed.')
      }
      await loadData()
    } catch (err) {
      setError(err.message || 'Unable to update punch')
    } finally {
      setPunchLoading('')
    }
  }

  const summary = useMemo(
    () => ({
      present: report?.presentDays ?? '-',
      half: report?.halfDayCount ?? '-',
      absent: report?.absentDays ?? '-',
      late: report?.lateCount ?? '-',
      hours:
        typeof report?.totalHoursWorked === 'number'
          ? report.totalHoursWorked.toFixed(2)
          : '-',
    }),
    [report],
  )

  const attendanceMap = useMemo(() => {
    const map = new Map()
    attendance.forEach((row) => {
      if (row?.date) {
        map.set(row.date, row)
      }
    })
    return map
  }, [attendance])

  const leaveDateSet = useMemo(() => {
    const set = new Set()
    approvedLeaves.forEach((leave) => {
      if (!leave?.startDate || !leave?.endDate) return
      const start = new Date(leave.startDate)
      const end = new Date(leave.endDate)
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return

      const cursor = new Date(start)
      while (cursor <= end) {
        set.add(
          toDateKey(
            cursor.getFullYear(),
            cursor.getMonth() + 1,
            cursor.getDate(),
          ),
        )
        cursor.setDate(cursor.getDate() + 1)
      }
    })
    return set
  }, [approvedLeaves])

  const holidayDateSet = useMemo(() => {
    const set = new Set()
    holidays.forEach((holiday) => {
      if (holiday?.date) {
        set.add(holiday.date)
      }
    })
    return set
  }, [holidays])

  const today = new Date()
  const todayKey = toDateKey(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  )

  const calendarDays = useMemo(() => {
    if (!numericMonth || !numericYear) return []

    const firstDay = new Date(numericYear, numericMonth - 1, 1)
    const lastDay = new Date(numericYear, numericMonth, 0)
    const startPadding = firstDay.getDay()
    const totalDays = lastDay.getDate()

    const cells = []
    for (let i = 0; i < startPadding; i += 1) {
      cells.push({ key: `pad-start-${i}`, isPadding: true })
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const dateString = toDateKey(numericYear, numericMonth, day)
      const entry = attendanceMap.get(dateString)
      const isOnLeave = leaveDateSet.has(dateString)
      const isHoliday = holidayDateSet.has(dateString)
      const isPastDate = dateString < todayKey
      const dayOfWeek = new Date(numericYear, numericMonth - 1, day).getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

      cells.push({
        key: dateString,
        isPadding: false,
        day,
        dateString,
        entry,
        isOnLeave,
        isHoliday,
        isWeekend,
        isPastDate,
        tone: statusTone(
          entry?.status,
          isOnLeave,
          isHoliday,
          isPastDate,
          isWeekend,
          attendanceLoaded,
        ),
      })
    }

    while (cells.length % 7 !== 0) {
      cells.push({ key: `pad-end-${cells.length}`, isPadding: true })
    }

    return cells
  }, [
    numericMonth,
    numericYear,
    attendanceMap,
    leaveDateSet,
    holidayDateSet,
    todayKey,
    attendanceLoaded,
  ])

  const handlePrevMonth = () => {
    if (!numericMonth || !numericYear) return
    if (numericMonth === 1) {
      setParams({ month: '12', year: String(numericYear - 1) })
    } else {
      setParams({ month: String(numericMonth - 1) })
    }
  }

  const handleNextMonth = () => {
    if (!numericMonth || !numericYear) return
    if (numericMonth === 12) {
      setParams({ month: '1', year: String(numericYear + 1) })
    } else {
      setParams({ month: String(numericMonth + 1) })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Attendance"
        subtitle="Track daily presence, verify work hours, and export monthly reports."
        actions={
          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="secondary"
              className="min-w-[118px]"
              disabled={punchLoading !== ''}
              onClick={() => handlePunch('in')}
            >
              {punchLoading === 'in' ? 'Punching in...' : 'Punch in'}
            </Button>
            <Button
              className="min-w-[118px]"
              disabled={punchLoading !== ''}
              onClick={() => handlePunch('out')}
            >
              {punchLoading === 'out' ? 'Punching out...' : 'Punch out'}
            </Button>
          </div>
        }
      />
      {feedback && <p className="mt-[-10px] mb-0 text-sm font-semibold text-green-700">{feedback}</p>}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
        <Card>
          <p className="m-0 text-xs uppercase tracking-[0.16em] text-slate-500">Present days</p>
          <h3 className="mt-2 mb-0 font-display text-2xl">{summary.present}</h3>
        </Card>
        <Card>
          <p className="m-0 text-xs uppercase tracking-[0.16em] text-slate-500">Half days</p>
          <h3 className="mt-2 mb-0 font-display text-2xl">{summary.half}</h3>
        </Card>
        <Card>
          <p className="m-0 text-xs uppercase tracking-[0.16em] text-slate-500">Absent days</p>
          <h3 className="mt-2 mb-0 font-display text-2xl">{summary.absent}</h3>
        </Card>
        <Card>
          <p className="m-0 text-xs uppercase tracking-[0.16em] text-slate-500">Late count</p>
          <h3 className="mt-2 mb-0 font-display text-2xl">{summary.late}</h3>
        </Card>
        <Card>
          <p className="m-0 text-xs uppercase tracking-[0.16em] text-slate-500">Total hours</p>
          <h3 className="mt-2 mb-0 font-display text-2xl">{summary.hours}</h3>
        </Card>
      </div>

      <Card>
        <div className="mb-3.5 flex items-center justify-between gap-3 max-lg:flex-col max-lg:items-start">
          <div>
            <h3>Attendance calendar</h3>
            <div className="mt-1.5 inline-flex items-center gap-2.5 max-lg:w-full max-lg:justify-between">
              <Button
                variant="ghost"
                className="min-w-[70px]"
                onClick={handlePrevMonth}
              >
                Prev
              </Button>
              <div className="flex items-center gap-2">
                <Select
                  className="min-w-[140px]"
                  value={month}
                  onChange={(event) => setParams({ month: event.target.value })}
                >
                  {MONTH_NAMES.map((label, index) => (
                    <option key={label} value={String(index + 1)}>
                      {label}
                    </option>
                  ))}
                </Select>
                <Select
                  className="min-w-[140px]"
                  value={year}
                  onChange={(event) => setParams({ year: event.target.value })}
                >
                  {yearOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                variant="ghost"
                className="min-w-[70px]"
                onClick={handleNextMonth}
              >
                Next
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block size-2.5 rounded-full bg-green-700/85" />
            <span>Present</span>
            <span className="inline-block size-2.5 rounded-full bg-teal-700/90" />
            <span>Manual punch</span>
            <span className="inline-block size-2.5 rounded-full bg-amber-700/85" />
            <span>Half day</span>
            <span className="inline-block size-2.5 rounded-full bg-red-600/85" />
            <span>Absent</span>
            <span className="inline-block size-2.5 rounded-full bg-green-600/85" />
            <span>Approved leave</span>
            <span className="inline-block size-2.5 rounded-full bg-sky-600/85" />
            <span>Holiday</span>
            <span className="inline-block size-2.5 rounded-full bg-red-700/90" />
            <span>Late marker L</span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {WEEK_DAYS.map((label) => (
            <div key={label} className="px-0.5 py-1 text-xs uppercase tracking-[0.12em] text-slate-500">
              {label}
            </div>
          ))}
          {calendarDays.map((cell) => {
            if (cell.isPadding) {
              return (
                <div
                  key={cell.key}
                  className="pointer-events-none invisible"
                />
              )
            }

            return (
              <button
                key={cell.key}
                type="button"
                className={`flex min-h-[90px] cursor-pointer flex-col gap-1.5 rounded-xl border border-slate-300 bg-white p-2.5 text-left transition duration-150 hover:-translate-y-px hover:shadow-[0_20px_45px_-25px_rgba(15,23,42,0.4)] max-lg:min-h-[78px] max-lg:p-2 ${CALENDAR_TONE_CLASSES[cell.tone] || ''}`}
                onClick={() => setSelectedDay(cell)}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <span className="font-display text-lg">{cell.day}</span>
                  <div className="flex gap-1">
                    {cell.isOnLeave && (
                      <span
                        className="rounded-full bg-green-700 px-1 py-0.5 text-[10px] leading-none font-bold text-white"
                        title="Approved leave"
                      >
                        L
                      </span>
                    )}
                    {cell.isHoliday && (
                      <span
                        className="rounded-full bg-sky-600 px-1 py-0.5 text-[10px] leading-none font-bold text-white"
                        title="Holiday"
                      >
                        H
                      </span>
                    )}
                    {cell.entry?.isLate && (
                      <span
                        className="rounded-full bg-red-700 px-1 py-0.5 text-[10px] leading-none font-bold text-white"
                        title="Late"
                      >
                        L
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] uppercase tracking-[0.08em] text-slate-500">
                  {cell.isOnLeave
                    ? 'LEAVE APPROVED'
                    : cell.isHoliday
                      ? 'HOLIDAY'
                    : cell.entry?.status
                      ? statusLabel(cell.entry.status)
                      : attendanceLoaded && cell.isPastDate
                        ? cell.isWeekend
                          ? 'WEEKEND'
                          : 'ABSENT'
                        : 'NO RECORD'}
                </span>
                <span className="text-[11px] text-[#132134]">
                  {workedLabel(cell.entry)}
                </span>
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="border border-slate-300 bg-slate-50 p-0">
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-between rounded-[10px] border border-transparent bg-transparent px-5 py-[18px] text-left text-lg font-semibold text-slate-800 hover:border-indigo-200 hover:bg-indigo-50"
          onClick={() => setLogOpen((prev) => !prev)}
        >
          <span>Attendance log</span>
          <span className={`inline-flex text-lg text-slate-700 transition-transform duration-200 ${logOpen ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </button>
        {logOpen && (
          <div className="px-5 pb-5">
            {error && <p className="text-orange-700">{error}</p>}
            {loading ? (
              <p>Loading...</p>
            ) : attendance.length === 0 ? (
              <EmptyState
                title="No attendance records"
                description="Punch in to create your first attendance entry."
              />
            ) : (
              <Table
                columns={[
                  'Date',
                  'Punch in',
                  'Punch out',
                  'Worked',
                  'Status',
                  'Late',
                  'On Leave',
                  'Holiday',
                ]}
              >
                {attendance.map((row) => (
                  <tr key={row.attendanceId || row.date}>
                    <td>{formatDate(row.date)}</td>
                    <td>{row.punchInTime || '-'}</td>
                    <td>{row.punchOutTime || '-'}</td>
                    <td>{workedLabel(row)}</td>
                    <td>
                      <Badge
                        tone={
                          row.status === 'PRESENT' || row.status === 'MANUAL_PUNCH'
                            ? 'success'
                            : row.status === 'HALF_DAY_PRESENT'
                              ? 'warning'
                              : 'neutral'
                        }
                      >
                        {statusLabel(row.status)}
                      </Badge>
                    </td>
                    <td>{row.isLate ? 'L' : '-'}</td>
                    <td>{leaveDateSet.has(row.date) ? 'L' : '-'}</td>
                    <td>{holidayDateSet.has(row.date) ? 'H' : '-'}</td>
                  </tr>
                ))}
              </Table>
            )}
          </div>
        )}
      </Card>

      {selectedDay && (
        <Modal
          title={`Attendance Details - ${formatDate(selectedDay.dateString)}`}
          onClose={() => setSelectedDay(null)}
        >
          <div className="flex flex-col gap-3.5">
            <p>
              <strong>Status:</strong>{' '}
              {selectedDay.isOnLeave
                ? 'Leave Approved'
                : selectedDay.isHoliday
                  ? 'Holiday'
                : selectedDay.entry?.status
                  ? statusLabel(selectedDay.entry.status)
                  : attendanceLoaded && selectedDay.isPastDate
                    ? selectedDay.isWeekend
                      ? 'Weekend'
                      : 'ABSENT'
                    : 'No attendance record'}
            </p>
            <p>
              <strong>Punch in:</strong> {selectedDay.entry?.punchInTime || '-'}
            </p>
            <p>
              <strong>Punch out:</strong> {selectedDay.entry?.punchOutTime || '-'}
            </p>
            <p>
              <strong>Worked:</strong> {workedLabel(selectedDay.entry)}
            </p>
            <p>
              <strong>Late:</strong> {selectedDay.entry?.isLate ? 'L' : '-'}
            </p>
            <p>
              <strong>Approved leave:</strong> {selectedDay.isOnLeave ? 'L' : '-'}
            </p>
            <p>
              <strong>Holiday:</strong> {selectedDay.isHoliday ? 'H' : '-'}
            </p>
            <p>
              <strong>Regularized:</strong>{' '}
              {selectedDay.entry?.isRegularized ? 'Yes' : 'No'}
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AttendancePage
