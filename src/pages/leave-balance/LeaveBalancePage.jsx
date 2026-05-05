import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import { getMyBalance } from '../../api/leaveBalance'
import PageHeader from '../../components/ui/PageHeader'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Input from '../../components/ui/Input'

const LeaveBalancePage = () => {
  const { token } = useContext(AuthContext)
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [balance, setBalance] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setError('')
      try {
        const data = await getMyBalance(token, { year })
        setBalance(data)
      } catch (err) {
        setError(err.message || 'Unable to load leave balance')
      }
    }
    load()
  }, [token, year])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Leave Balance"
        subtitle="Review available leave balances for the year."
        actions={
          <Input
            type="number"
            value={year}
            onChange={(event) => setYear(event.target.value)}
          />
        }
      />
      {error && <p className="text-orange-700">{error}</p>}
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
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
        <StatCard
          label="Carry forward"
          value={balance?.carriedForwardEarnedDays}
        />
      </div>
    </div>
  )
}

export default LeaveBalancePage
