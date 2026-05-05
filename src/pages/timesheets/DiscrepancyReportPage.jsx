import { useContext, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import { getDiscrepancyReport } from '../../api/timesheets'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const DiscrepancyReportPage = () => {
  const { token } = useContext(AuthContext)
  const [employeeId, setEmployeeId] = useState('')
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')

  const handleFetch = async () => {
    setError('')
    try {
      const data = await getDiscrepancyReport(token, employeeId, { month, year })
      setReport(data)
    } catch (err) {
      setError(err.message || 'Unable to load report')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Discrepancy Report"
        subtitle="Compare attendance with timesheet submissions."
      />
      <Card className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Employee ID"
          value={employeeId}
          onChange={(event) => setEmployeeId(event.target.value)}
        />
        <Input
          type="number"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
        />
        <Input
          type="number"
          value={year}
          onChange={(event) => setYear(event.target.value)}
        />
        <Button onClick={handleFetch}>Generate</Button>
      </Card>
      {error && <p className="text-orange-700">{error}</p>}
      <Card>
        <h3>Report</h3>
        {report ? (
          <pre className="overflow-auto rounded-[10px] bg-slate-900 p-4 text-[13px] text-slate-200">{JSON.stringify(report, null, 2)}</pre>
        ) : (
          <p>Enter an employee ID to view discrepancies.</p>
        )}
      </Card>
    </div>
  )
}

export default DiscrepancyReportPage
