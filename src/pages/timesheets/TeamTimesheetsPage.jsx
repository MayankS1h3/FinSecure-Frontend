import { useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import {
  decideTimesheet,
  getDiscrepancyReport,
  getTeamTimesheets,
} from '../../api/timesheets'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import Table from '../../components/ui/Table'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import TextArea from '../../components/ui/TextArea'

const TeamTimesheetsPage = () => {
  const { token } = useContext(AuthContext)
  const now = new Date()
  const [teamRows, setTeamRows] = useState([])
  const [teamError, setTeamError] = useState('')
  const [teamPage, setTeamPage] = useState(0)
  const [teamSize, setTeamSize] = useState(10)
  const [teamPageInfo, setTeamPageInfo] = useState({ page: 0, totalPages: 0 })

  const [active, setActive] = useState(null)
  const [decision, setDecision] = useState('APPROVED')
  const [reason, setReason] = useState('')

  const [reportEmployeeId, setReportEmployeeId] = useState('')
  const [reportMonth, setReportMonth] = useState(String(now.getMonth() + 1))
  const [reportYear, setReportYear] = useState(String(now.getFullYear()))
  const [employeeOptions, setEmployeeOptions] = useState([])
  const [report, setReport] = useState(null)
  const [reportError, setReportError] = useState('')

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

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear()
    return Array.from({ length: 11 }, (_, index) => String(current - 5 + index))
  }, [])

  useEffect(() => {
    const loadTeamTimesheets = async () => {
      setTeamError('')
      try {
        const data = await getTeamTimesheets(token, {
          month: reportMonth,
          year: reportYear,
          page: teamPage,
          size: teamSize,
        })
        setTeamRows(data?.content || data || [])
        setTeamPageInfo({
          page: data?.number ?? teamPage,
          totalPages: data?.totalPages ?? 0,
        })
      } catch (err) {
        setTeamError(err.message || 'Unable to load team timesheets')
      }
    }

    loadTeamTimesheets()
  }, [token, reportMonth, reportYear, teamPage, teamSize])

  useEffect(() => {
    const loadEmployeeOptions = async () => {
      setReportError('')
      try {
        const data = await getTeamTimesheets(token, {
          month: reportMonth,
          year: reportYear,
          page: 0,
          size: 200,
        })
        const rows = data?.content || data || []
        const options = rows
          .map((sheet) => ({
            id: String(sheet.employeeId),
            label: `${sheet.employeeName || 'Employee'} ${sheet.employeeId}`,
          }))
          .filter(
            (option, index, arr) =>
              option.id && arr.findIndex((item) => item.id === option.id) === index,
          )

        setEmployeeOptions(options)
        setReportEmployeeId((prev) => {
          if (prev && options.some((option) => option.id === prev)) return prev
          return options[0]?.id || ''
        })
      } catch (err) {
        setEmployeeOptions([])
        setReportEmployeeId('')
        setReportError(err.message || 'Unable to load team members')
      }
    }

    loadEmployeeOptions()
  }, [token, reportMonth, reportYear])

  const handleDecision = async () => {
    if (!active) return
    try {
      await decideTimesheet(token, active.timesheetId, {
        status: decision,
        rejectionReason: reason.trim() || null,
      })
      setActive(null)
      setReason('')
      const data = await getTeamTimesheets(token, {
        month: reportMonth,
        year: reportYear,
        page: teamPage,
        size: teamSize,
      })
      setTeamRows(data?.content || data || [])
      setTeamPageInfo({
        page: data?.number ?? teamPage,
        totalPages: data?.totalPages ?? 0,
      })
    } catch (err) {
      setTeamError(err.message || 'Unable to process decision')
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

  const handleGenerateReport = async () => {
    if (!reportEmployeeId) {
      setReportError('Select a team member first')
      return
    }

    setReportError('')
    try {
      const data = await getDiscrepancyReport(token, Number(reportEmployeeId), {
        month: reportMonth,
        year: reportYear,
      })
      setReport(data)
    } catch (err) {
      setReport(null)
      setReportError(err.message || 'Unable to generate discrepancy report')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Team Timesheets"
        subtitle="Review pending team timesheets and generate discrepancy reports."
      />

      <Card>
        <h3>Team timesheets</h3>
        {teamError && <p className="text-orange-700">{teamError}</p>}
        {teamRows.length === 0 ? (
          <EmptyState
            title="No team timesheets"
            description="No team timesheets found for selected month and year."
          />
        ) : (
          <>
            <Table columns={['Employee', 'Month', 'Year', 'Status', 'Hours', 'Action']}>
              {teamRows.map((sheet) => (
                <tr key={sheet.timesheetId}>
                  <td>{sheet.employeeName || sheet.employeeId}</td>
                  <td>{sheet.month}</td>
                  <td>{sheet.year}</td>
                  <td>{sheet.status}</td>
                  <td>{sheet.formattedTotalTime || '-'}</td>
                  <td>
                    {sheet.status === 'PENDING' ? (
                      <Button variant="secondary" onClick={() => openDecisionModal(sheet)}>
                        Decide
                      </Button>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </Table>
            <div className="flex flex-wrap gap-2.5">
              <Select
                value={String(teamSize)}
                onChange={(event) => {
                  setTeamSize(Number(event.target.value))
                  setTeamPage(0)
                }}
              >
                <option value="5">5 / page</option>
                <option value="10">10 / page</option>
                <option value="20">20 / page</option>
              </Select>
            </div>
            <Pagination
              page={teamPageInfo.page}
              totalPages={teamPageInfo.totalPages}
              onPageChange={(nextPage) => setTeamPage(nextPage)}
            />
          </>
        )}
      </Card>

      <Card>
        <h3>Discrepancy report filters</h3>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-500">Employee (Name + ID)</span>
          <Select
            value={reportEmployeeId}
            onChange={(event) => setReportEmployeeId(event.target.value)}
          >
            {employeeOptions.length === 0 ? (
              <option value="">No team members found</option>
            ) : (
              employeeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))
            )}
          </Select>
          <Select
            value={reportMonth}
            onChange={(event) => {
              setReportMonth(event.target.value)
              setTeamPage(0)
            }}
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            value={reportYear}
            onChange={(event) => {
              setReportYear(event.target.value)
              setTeamPage(0)
            }}
          >
            {yearOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <Button onClick={handleGenerateReport}>Generate report</Button>
        </div>
        {reportError && <p className="text-orange-700">{reportError}</p>}
      </Card>

      <Card>
        <h3>Discrepancy report</h3>
        {report ? (
          <pre className="overflow-auto rounded-[10px] bg-slate-900 p-4 text-[13px] text-slate-200">{JSON.stringify(report, null, 2)}</pre>
        ) : (
          <p>Select filters and generate a report.</p>
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
    </div>
  )
}

export default TeamTimesheetsPage
