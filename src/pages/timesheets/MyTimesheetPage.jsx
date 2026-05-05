import { useCallback, useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import { getMyTimesheet, submitTimesheet } from '../../api/timesheets'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const MyTimesheetPage = () => {
  const { token } = useContext(AuthContext)
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [timesheet, setTimesheet] = useState(null)
  const [error, setError] = useState('')

  const loadTimesheet = useCallback(async () => {
    setError('')
    try {
      const data = await getMyTimesheet(token, { month, year })
      setTimesheet(data)
    } catch (err) {
      setError(err.message || 'Unable to load timesheet')
    }
  }, [token, month, year])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTimesheet()
  }, [loadTimesheet])

  const handleSubmit = async () => {
    if (!timesheet?.timesheetId) return
    try {
      await submitTimesheet(token, timesheet.timesheetId)
      await loadTimesheet()
    } catch (err) {
      setError(err.message || 'Unable to submit timesheet')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Timesheet"
        subtitle="Review totals before submitting for approval."
        actions={
          <div className="flex flex-wrap gap-2.5">
            <Input
              type="number"
              value={month}
              min="1"
              max="12"
              onChange={(event) => setMonth(event.target.value)}
            />
            <Input
              type="number"
              value={year}
              min="2020"
              max="2100"
              onChange={(event) => setYear(event.target.value)}
            />
          </div>
        }
      />
      {error && <p className="text-orange-700">{error}</p>}
      <Card>
        <h3>Timesheet summary</h3>
        <p>Status: {timesheet?.status || 'Draft'}</p>
        <p>Total time: {timesheet?.formattedTotalTime || '-'}</p>
        <p>Rejection reason: {timesheet?.rejectionReason || '-'}</p>
        <Button onClick={handleSubmit}>Submit for approval</Button>
      </Card>
    </div>
  )
}

export default MyTimesheetPage
