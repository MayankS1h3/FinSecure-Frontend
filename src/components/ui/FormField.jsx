const FormField = ({ label, helper, error, children }) => {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-semibold">{label}</span>
      {children}
      {helper && <span className="text-xs text-slate-500">{helper}</span>}
      {error && <span className="text-xs text-orange-700">{error}</span>}
    </label>
  )
}

export default FormField
