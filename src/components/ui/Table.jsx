const Table = ({ columns, children }) => {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="border-b border-slate-200 px-2.5 py-3 text-left text-xs uppercase tracking-[0.12em] text-slate-500"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr>td]:border-b [&>tr>td]:border-slate-200 [&>tr>td]:px-2.5 [&>tr>td]:py-3">
          {children}
        </tbody>
      </table>
    </div>
  )
}

export default Table
