import { useCallback, useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import { decideTimesheet, getPendingTimesheets } from '../../api/timesheets'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import TextArea from '../../components/ui/TextArea'
import EmptyState from '../../components/ui/EmptyState'
import Select from '../../components/ui/Select'
import FormField from '../../components/ui/FormField'
import Pagination from '../../components/ui/Pagination'
import useQueryParams from '../../hooks/useQueryParams'

const PendingTimesheetsPage = () => {
  const { token } = useContext(AuthContext)
  const { getParam, setParams } = useQueryParams()
  const page = Number(getParam('page', '0'))
  const size = Number(getParam('size', '10'))
  const [rows, setRows] = useState([])
  const [active, setActive] = useState(null)
  const [decision, setDecision] = useState('APPROVED')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 0 })

  const load = useCallback(async () => {
    setError('')
    try {
      const data = await getPendingTimesheets(token, { page, size })
      setRows(data?.content || data || [])
      setPageInfo({
        page: data?.number ?? page,
        totalPages: data?.totalPages ?? 0,
      })
    } catch (err) {
      setError(err.message || 'Unable to load pending timesheets')
    }
  }, [token, page, size])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const handleDecision = async () => {
    if (!active) return
    try {
      await decideTimesheet(token, active.timesheetId, {
        status: decision,
        rejectionReason: reason.trim() || null,
      })
      setActive(null)
      setReason('')
      await load()
    } catch (err) {
      setError(err.message || 'Unable to process decision')
    }
  }

  const openDecisionModal = (timesheet) => {
    setActive(timesheet)
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
        title="Pending Timesheets"
        subtitle="Approve or reject employee submissions."
        actions={
          <div className="flex flex-wrap gap-2.5">
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
        {rows.length === 0 ? (
          <EmptyState
            title="No pending timesheets"
            description="All submissions are already processed."
          />
        ) : (
          <>
            <Table columns={['Employee', 'Status', 'Hours', 'Action']}>
              {rows.map((sheet) => (
                <tr key={sheet.timesheetId}>
                  <td>{sheet.employeeName || sheet.employeeId}</td>
                  <td>{sheet.status}</td>
                  <td>{sheet.formattedTotalTime || '-'}</td>
                  <td>
                    <Button variant="secondary" onClick={() => openDecisionModal(sheet)}>
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
          title="Timesheet decision"
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

export default PendingTimesheetsPage
