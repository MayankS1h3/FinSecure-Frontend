import { formatHours } from '../../utils/format'

const StatCard = ({ label, value, isHours }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5">
      <p className="m-0 text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <h3 className="mt-2 mb-0 font-display text-2xl">
        {isHours ? formatHours(value) : value ?? '-'}
      </h3>
    </div>
  )
}

export default StatCard
