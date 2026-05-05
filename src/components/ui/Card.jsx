const Card = ({ className = '', children }) => {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.4)] ${className}`.trim()}
    >
      {children}
    </section>
  )
}

export default Card
