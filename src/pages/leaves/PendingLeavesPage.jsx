import { useCallback, useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import { getPendingLeaves, processLeave } from '../../api/leaves'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import TextArea from '../../components/ui/TextArea'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import FormField from '../../components/ui/FormField'
import Pagination from '../../components/ui/Pagination'
import useQueryParams from '../../hooks/useQueryParams'
import { formatDate } from '../../utils/format'

const PendingLeavesPage = () => {
  const { token } = useContext(AuthContext)
  const { getParam, setParams } = useQueryParams()
  const [requests, setRequests] = useState([])
  const [active, setActive] = useState(null)
  const [decision, setDecision] = useState('APPROVED')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 0 })

  const page = Number(getParam('page', '0'))
  const size = Number(getParam('size', '10'))

  const loadData = useCallback(async () => {
    setError('')
    try {
      const data = await getPendingLeaves(token, { page, size })
      setRequests(data?.content || data || [])
      setPageInfo({
        page: data?.number ?? page,
        totalPages: data?.totalPages ?? 0,
      })
    } catch (err) {
      setError(err.message || 'Unable to load pending leaves')
    }
  }, [token, page, size])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  const handleDecision = async () => {
    if (!active) return
    try {
      await processLeave(token, active.leaveId, {
        status: decision,
        rejectionReason: reason.trim() || null,
      })
      setActive(null)
      setReason('')
      await loadData()
    } catch (err) {
      setError(err.message || 'Unable to process leave')
    }
  }

  const openDecisionModal = (leave) => {
    setActive(leave)
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
        title="Pending Leaves"
        subtitle="Review and approve team leave requests."
        actions={
          <div className="flex flex-wrap gap-2.5">
            <Input
              type="number"
              min="0"
              value={page}
              onChange={(event) => setParams({ page: event.target.value })}
            />
            <Select
              value={String(size)}
              onChange={(event) =>
                setParams({ size: event.target.value, page: '0' })
              }
            >
              <option value="5">5 / page</option>
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
            </Select>
          </div>
        }
      />
      <Card>
        {error && <p className="text-orange-700">{error}</p>}
        {requests.length === 0 ? (
          <EmptyState
            title="No pending leaves"
            description="All team leave requests have been processed."
          />
        ) : (
          <>
            <Table columns={['Employee', 'Dates', 'Type', 'Days', 'Action']}>
              {requests.map((leave) => (
                <tr key={leave.leaveId}>
                  <td>{leave.employeeName || leave.employeeId}</td>
                  <td>
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </td>
                  <td>{leave.leaveType}</td>
                  <td>{leave.totalDays}</td>
                  <td>
                    <Button variant="secondary" onClick={() => openDecisionModal(leave)}>
                      Decide
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
            <Pagination
              page={pageInfo.page}
              totalPages={pageInfo.totalPages}
              onPageChange={(nextPage) => setParams({ page: String(nextPage) })}
            />
          </>
        )}
      </Card>

      {active && (
        <Modal
          title="Decision"
          onClose={closeDecisionModal}
          onConfirm={handleDecision}
          confirmLabel="Submit"
        >
          <div className="flex flex-col gap-3.5">
            <FormField label="Decision">
              <Select
                value={decision}
                onChange={(event) => setDecision(event.target.value)}
              >
                <option value="APPROVED">Approve</option>
                <option value="REJECTED">Reject</option>
              </Select>
            </FormField>
            <FormField label="Rejection reason (optional)">
              <TextArea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows="3"
                placeholder="Add context if needed"
              />
            </FormField>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default PendingLeavesPage
