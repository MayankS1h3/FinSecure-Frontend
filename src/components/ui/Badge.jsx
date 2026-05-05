import { toTitle } from '../../utils/format'

const toneClassNames = {
  success: 'bg-green-700/15 text-green-700',
  warning: 'bg-amber-700/15 text-amber-700',
  neutral: 'bg-teal-700/10 text-teal-700',
}

const Badge = ({ tone = 'neutral', children }) => {
  return (
    <span
      className={`rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold ${toneClassNames[tone] || toneClassNames.neutral}`}
    >
      {toTitle(children)}
    </span>
  )
}

export default Badge
