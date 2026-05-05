import { useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import { applyLeave, cancelLeave, getMyLeaves } from '../../api/leaves'
import { getMyBalance } from '../../api/leaveBalance'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import TextArea from '../../components/ui/TextArea'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import StatCard from '../../components/ui/StatCard'
import useQueryParams from '../../hooks/useQueryParams'
import { formatDate } from '../../utils/format'

const MyLeavesPage = () => {
  const { token } = useContext(AuthContext)
  const { getParam, setParams } = useQueryParams()
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'SICK',
    reasonForLeave: '',
  })
  const [leaves, setLeaves] = useState([])
  const [balance, setBalance] = useState(null)
  const [error, setError] = useState('')
  const [balanceError, setBalanceError] = useState('')
  const [loading, setLoading] = useState(false)

  const status = getParam('status', '')
  const year = getParam('year', '')
  const month = getParam('month', '')
  const normalizedMonth = month ? String(Number(month)) : ''
  const page = Number(getParam('page', '0'))
  const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 0 })
  const currentYear = new Date().getFullYear()
  const balanceYear = year || String(currentYear)
  const hasFilters = Boolean(status || year || normalizedMonth)
  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear()
    const start = 2000
    const end = current + 5
    return Array.from({ length: end - start + 1 }, (_, index) =>
      String(start + index),
    )
  }, [])
  const monthOptions = useMemo(
    () => [
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
    ],
    [],
  )

  const loadLeaves = async () => {
    if (!hasFilters) {
      setLeaves([])
      setPageInfo({ page: 0, totalPages: 0 })
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await getMyLeaves(token, {
        status,
        year,
        month: normalizedMonth,
        page,
      })
      setLeaves(data?.content || data || [])
      setPageInfo({
        page: data?.number ?? page,
        totalPages: data?.totalPages ?? 0,
      })
    } catch (err) {
      setError(err.message || 'Unable to load leaves')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaves()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, year, normalizedMonth, page])

  useEffect(() => {
    const loadBalance = async () => {
      setBalanceError('')
      try {
        const data = await getMyBalance(token, { year: balanceYear })
        setBalance(data)
      } catch (err) {
        setBalanceError(err.message || 'Unable to load leave balance')
      }
    }
    loadBalance()
  }, [token, balanceYear])

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await applyLeave(token, form)
      setForm({
        startDate: '',
        endDate: '',
        leaveType: 'SICK',
        reasonForLeave: '',
      })
      await loadLeaves()
    } catch (err) {
      setError(err.message || 'Unable to apply leave')
    }
  }

  const handleCancel = async (leaveId) => {
    setError('')
    try {
      await cancelLeave(token, leaveId)
      await loadLeaves()
    } catch (err) {
      setError(err.message || 'Unable to cancel leave')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Leaves"
        subtitle="Apply for leave and monitor approval progress."
      />

      <Card>
        <div className="flex items-center justify-between gap-4 max-lg:flex-col max-lg:items-start">
          <div>
            <p className="m-0 text-xs uppercase tracking-[0.18em] text-slate-500">Overview</p>
            <h2 className="my-1.5 font-display text-3xl">Leave balance</h2>
          </div>
          <Select
            value={balanceYear}
            onChange={(event) =>
              setParams({ year: event.target.value, page: '0' })
            }
          >
            {yearOptions.map((optionYear) => (
              <option key={optionYear} value={optionYear}>
                {optionYear}
              </option>
            ))}
          </Select>
        </div>
        {balanceError && <p className="text-orange-700">{balanceError}</p>}
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          <Card className="flex flex-col gap-3">
            <h3>Sick Leave</h3>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Available" value={balance?.sickLeaveBalance} />
              <StatCard label="Reserved" value={balance?.reservedSickLeaves} />
              <StatCard label="Consumed" value={balance?.sickLeavesConsumed} />
            </div>
          </Card>
          <Card className="flex flex-col gap-3">
            <h3>Casual Leave</h3>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Available" value={balance?.casualLeaveBalance} />
              <StatCard label="Reserved" value={balance?.reservedCasualLeaves} />
              <StatCard label="Consumed" value={balance?.casualLeavesConsumed} />
            </div>
          </Card>
          <Card className="flex flex-col gap-3">
            <h3>Earned Leave</h3>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Available" value={balance?.earnedLeaveBalance} />
              <StatCard label="Reserved" value={balance?.reservedEarnedLeaves} />
              <StatCard label="Consumed" value={balance?.earnedLeavesConsumed} />
            </div>
          </Card>
        </div>
        <div className="mt-3 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
          <StatCard
            label="Carry forward"
            value={balance?.carriedForwardEarnedDays}
          />
        </div>
      </Card>

      <Card>
        <h3>Apply leave</h3>
        <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
          <FormField label="Start date">
            <Input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="End date">
            <Input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Leave type">
            <Select
              name="leaveType"
              value={form.leaveType}
              onChange={handleChange}
            >
              <option value="SICK">Sick</option>
              <option value="CASUAL">Casual</option>
              <option value="EARNED">Earned</option>
              <option value="UNPAID">Unpaid</option>
            </Select>
          </FormField>
          <FormField label="Reason">
            <TextArea
              name="reasonForLeave"
              value={form.reasonForLeave}
              onChange={handleChange}
              rows="3"
              required
            />
          </FormField>
          <Button type="submit">Submit leave</Button>
        </form>
        {error && <p className="text-orange-700">{error}</p>}
      </Card>

      <Card>
        <h3>Filters</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={status}
            onChange={(event) =>
              setParams({ status: event.target.value, page: '0' })
            }
          >
            <option value="">__</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
            <option value="CANCELLATION_PENDING">Cancellation Pending</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EXPIRED">Expired</option>
          </Select>
          <Select
            value={year}
            onChange={(event) =>
              setParams({ year: event.target.value, page: '0' })
            }
          >
            <option value="">__</option>
            {yearOptions.map((optionYear) => (
              <option key={optionYear} value={optionYear}>
                {optionYear}
              </option>
            ))}
          </Select>
          <Select
            value={normalizedMonth}
            onChange={(event) =>
              setParams({ month: event.target.value, page: '0' })
            }
          >
            <option value="">__</option>
            {monthOptions.map((optionMonth) => (
              <option key={optionMonth.value} value={optionMonth.value}>
                {optionMonth.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        <h3>Leave requests</h3>
        {loading ? (
          <p>Loading...</p>
        ) : leaves.length === 0 ? (
          <EmptyState
            title="No leave requests"
            description="Apply for leave to see your requests here."
          />
        ) : (
          <>
            <Table columns={['Dates', 'Type', 'Days', 'Status', 'Rejection Reason', 'Actions']}>
              {leaves.map((leave) => (
                <tr key={leave.leaveId || leave.startDate}>
                  <td>
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </td>
                  <td>{leave.leaveType}</td>
                  <td>{leave.totalDays}</td>
                  <td>
                    <Badge
                      tone={
                        leave.status === 'APPROVED'
                          ? 'success'
                          : leave.status === 'REJECTED'
                            ? 'warning'
                            : 'neutral'
                      }
                    >
                      {leave.status}
                    </Badge>
                  </td>
                  <td>{leave.rejectionReason || '-'}</td>
                  <td>
                    {leave.status === 'PENDING' ? (
                      <Button
                        variant="ghost"
                        onClick={() => handleCancel(leave.leaveId)}
                      >
                        Cancel
                      </Button>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </Table>
            {hasFilters && (
              <Pagination
                page={pageInfo.page}
                totalPages={pageInfo.totalPages}
                onPageChange={(nextPage) =>
                  setParams({ page: String(nextPage) })
                }
                showAlways
              />
            )}
          </>
        )}
      </Card>
    </div>
  )
}

export default MyLeavesPage
