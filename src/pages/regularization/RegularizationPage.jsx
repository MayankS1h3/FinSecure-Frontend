import { useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import {
  createRegularization,
  decideRegularization,
  getMyRegularizations,
  getPendingRegularizations,
} from '../../api/regularizations'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import TextArea from '../../components/ui/TextArea'
import Table from '../../components/ui/Table'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import useQueryParams from '../../hooks/useQueryParams'

const RegularizationPage = () => {
  const { token, user } = useContext(AuthContext)
  const { getParam, setParams } = useQueryParams()
  const [form, setForm] = useState({
    date: '',
    punchInTime: '',
    punchOutTime: '',
    reason: '',
  })
  const [myRequests, setMyRequests] = useState([])
  const [pending, setPending] = useState([])
  const [active, setActive] = useState(null)
  const [decision, setDecision] = useState('APPROVED')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const asList = (data) => {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.content)) return data.content
    return []
  }

  const status = getParam('status', '')
  const month = getParam('month', '')
  const normalizedMonth = month ? String(Number(month)) : ''
  const year = getParam('year', '')
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

  const loadData = async () => {
    setError('')
    try {
      const [myData, pendingData] = await Promise.all([
        getMyRegularizations(token, {
          status,
          month: normalizedMonth,
          year,
        }),
        user?.role === 'MANAGER' ? getPendingRegularizations(token) : [],
      ])
      setMyRequests(asList(myData))
      setPending(asList(pendingData))
    } catch (err) {
      setError(err.message || 'Unable to load regularizations')
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, status, normalizedMonth, year])

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!form.punchInTime && !form.punchOutTime) {
      setError('Please provide punch-in time or punch-out time.')
      return
    }

    const payload = {
      ...form,
      punchInTime: form.punchInTime || null,
      punchOutTime: form.punchOutTime || null,
    }

    try {
      await createRegularization(token, payload)
      setForm({ date: '', punchInTime: '', punchOutTime: '', reason: '' })
      await loadData()
    } catch (err) {
      setError(err.message || 'Unable to submit regularization')
    }
  }

  const handleDecision = async () => {
    if (!active) return
    try {
      await decideRegularization(token, active.requestId, {
        status: decision,
        rejectionReason: reason.trim() || null,
      })
      setActive(null)
      setReason('')
      await loadData()
    } catch (err) {
      setError(err.message || 'Unable to process decision')
    }
  }

  const openDecisionModal = (request) => {
    setActive(request)
    setDecision('APPROVED')
    setReason('')
  }

  const closeDecisionModal = () => {
    setActive(null)
    setDecision('APPROVED')
    setReason('')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Regularization"
        subtitle="Submit and approve attendance regularization requests."
      />
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        <Card>
          <h3>Request regularization</h3>
          <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
            <FormField label="Attendance date">
              <Input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </FormField>
            <FormField label="Punch-in time">
              <Input
                type="time"
                name="punchInTime"
                value={form.punchInTime}
                onChange={handleChange}
              />
            </FormField>
            <FormField label="Punch-out time">
              <Input
                type="time"
                name="punchOutTime"
                value={form.punchOutTime}
                onChange={handleChange}
              />
            </FormField>
            <FormField label="Reason">
              <TextArea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                rows="3"
                required
              />
            </FormField>
            <Button type="submit">Submit request</Button>
          </form>
        </Card>
      </div>

      <Card>
        <h3>Filters</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={status}
            onChange={(event) =>
              setParams({ status: event.target.value })
            }
          >
            <option value="">__</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </Select>
          <Select
            value={normalizedMonth}
            onChange={(event) => setParams({ month: event.target.value })}
          >
            <option value="">__</option>
            {monthOptions.map((optionMonth) => (
              <option key={optionMonth.value} value={optionMonth.value}>
                {optionMonth.label}
              </option>
            ))}
          </Select>
          <Select
            value={year}
            onChange={(event) => setParams({ year: event.target.value })}
          >
            <option value="">__</option>
            {yearOptions.map((optionYear) => (
              <option key={optionYear} value={optionYear}>
                {optionYear}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        <h3>My requests</h3>
        {myRequests.length === 0 ? (
          <EmptyState
            title="No requests"
            description="Submit a regularization request to see it here."
          />
        ) : (
          <Table columns={['Date', 'Punch In', 'Punch Out', 'Reason', 'Status', 'Rejection Reason']}>
            {myRequests.map((request) => (
              <tr key={request.requestId}>
                <td>{request.date}</td>
                <td>{request.punchInTime || '-'}</td>
                <td>{request.punchOutTime || '-'}</td>
                <td>{request.reason}</td>
                <td>{request.status}</td>
                <td>{request.rejectionReason || '-'}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {user?.role === 'MANAGER' && (
        <Card>
          <h3>Pending approvals</h3>
          {pending.length === 0 ? (
            <EmptyState
              title="No pending requests"
              description="All requests are processed."
            />
          ) : (
            <Table columns={['Employee', 'Date', 'Reason', 'Action']}>
              {pending.map((request) => (
                <tr key={request.requestId}>
                  <td>{request.employeeName || request.employeeId}</td>
                  <td>{request.date}</td>
                  <td>{request.reason}</td>
                  <td>
                    <Button
                      variant="secondary"
                      onClick={() => openDecisionModal(request)}
                    >
                      Decide
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      )}

      {active && (
        <Modal
          title="Regularization decision"
          onClose={closeDecisionModal}
          onConfirm={handleDecision}
          confirmLabel="Submit"
        >
          <div className="flex flex-col gap-3.5">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-semibold">Decision</span>
              <select
                className="rounded-[10px] border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-500/20"
                value={decision}
                onChange={(event) => setDecision(event.target.value)}
              >
                <option value="APPROVED">Approve</option>
                <option value="REJECTED">Reject</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-semibold">Rejection reason (optional)</span>
              <TextArea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows="3"
                placeholder="Add context if needed"
              />
            </label>
          </div>
        </Modal>
      )}

      {error && <p className="text-orange-700">{error}</p>}
    </div>
  )
}

export default RegularizationPage
