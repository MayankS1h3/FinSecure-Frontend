import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'

const FinanceDashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Finance Overview"
        subtitle="Track operational throughput and workforce utilization."
      />
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
        <StatCard label="Monthly Utilization" value="86%" />
        <StatCard label="Compliance" value="94%" />
        <StatCard label="Payroll Ready" value="Yes" />
      </div>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        <Card>
          <h3>Cost center view</h3>
          <p>Stay aligned with leave patterns and time capture quality.</p>
        </Card>
        <Card>
          <h3>Reporting cadence</h3>
          <p>Discrepancy reports are available under Timesheets.</p>
        </Card>
      </div>
    </div>
  )
}

export default FinanceDashboard
