const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="flex items-center justify-between gap-4 max-lg:flex-col max-lg:items-start">
      <div>
        <p className="m-0 text-xs uppercase tracking-[0.18em] text-slate-500">Module</p>
        <h2 className="my-1.5 font-display text-3xl">{title}</h2>
        {subtitle && <p className="m-0 text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}

export default PageHeader
