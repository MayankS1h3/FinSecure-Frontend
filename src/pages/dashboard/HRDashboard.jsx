import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'

const HRDashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="HR Operations"
        subtitle="Manage holidays, leave balances, and policy adherence."
      />
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
        <StatCard label="Upcoming Holidays" value="3" />
        <StatCard label="Leaves Approved" value="18" />
        <StatCard label="Teams On Track" value="7" />
      </div>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        <Card>
          <h3>Leave analytics</h3>
          <p>Monitor leave types and usage across the organization.</p>
        </Card>
        <Card>
          <h3>Holiday planning</h3>
          <p>Update company holiday calendars for the next quarter.</p>
        </Card>
      </div>
    </div>
  )
}

export default HRDashboard
