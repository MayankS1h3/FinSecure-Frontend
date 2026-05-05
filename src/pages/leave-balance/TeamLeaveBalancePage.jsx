import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import { getTeamBalances } from '../../api/leaveBalance'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import Input from '../../components/ui/Input'
import EmptyState from '../../components/ui/EmptyState'

const TeamLeaveBalancePage = () => {
  const { token } = useContext(AuthContext)
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setError('')
      try {
        const data = await getTeamBalances(token, { year })
        setRows(data || [])
      } catch (err) {
        setError(err.message || 'Unable to load team balances')
      }
    }
    load()
  }, [token, year])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Team Leave Balances"
        subtitle="Monitor team leave availability by year."
        actions={
          <Input
            type="number"
            value={year}
            onChange={(event) => setYear(event.target.value)}
          />
        }
      />
      <Card>
        {error && <p className="text-orange-700">{error}</p>}
        {rows.length === 0 ? (
          <EmptyState
            title="No balances"
            description="No team leave balances returned for this year."
          />
        ) : (
          <Table columns={['Employee', 'Sick', 'Casual', 'Earned', 'Carry']}>
            {rows.map((row) => (
              <tr key={row.employeeId}>
                <td>{row.employeeName || row.employeeId}</td>
                <td>{row.sickLeaveBalance}</td>
                <td>{row.casualLeaveBalance}</td>
                <td>{row.earnedLeaveBalance}</td>
                <td>{row.carriedForwardEarnedDays}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  )
}

export default TeamLeaveBalancePage
