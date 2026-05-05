const baseClassName =
  'cursor-pointer rounded-full border border-transparent px-4 py-2.5 font-semibold transition duration-200 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'

const variantClassNames = {
  primary:
    'bg-blue-700 text-white hover:-translate-y-px hover:bg-blue-800 hover:shadow-[0_8px_20px_-12px_rgba(29,78,216,0.7)]',
  secondary:
    'bg-teal-700 text-white hover:-translate-y-px hover:shadow-[0_8px_20px_-12px_rgba(15,118,110,0.7)]',
  warning:
    'bg-orange-700 text-white hover:-translate-y-px hover:bg-orange-800 hover:shadow-[0_8px_20px_-12px_rgba(194,65,12,0.7)]',
  danger:
    'bg-red-700 text-white hover:-translate-y-px hover:bg-red-800 hover:shadow-[0_8px_20px_-12px_rgba(185,28,28,0.75)]',
  ghost: 'border-slate-200 bg-transparent text-[#132134] hover:bg-slate-100',
}

const Button = ({ variant = 'primary', className = '', ...props }) => {
  const variantClassName = variantClassNames[variant] || variantClassNames.primary

  return (
    <button
      className={`${baseClassName} ${variantClassName} ${className}`.trim()}
      {...props}
    />
  )
}

export default Button
