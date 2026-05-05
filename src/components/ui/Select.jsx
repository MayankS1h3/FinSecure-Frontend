const Select = ({ className = '', children, ...props }) => {
  return (
    <select
      className={`rounded-[10px] border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-500/20 ${className}`.trim()}
      {...props}
    >
      {children}
    </select>
  )
}

export default Select
