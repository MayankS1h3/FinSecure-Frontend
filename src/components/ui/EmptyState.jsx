const EmptyState = ({ title, description }) => {
  return (
    <div className="rounded-[10px] bg-slate-100 p-8 text-center">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

export default EmptyState
