import Button from './Button'

const Pagination = ({ page, totalPages, onPageChange, showAlways = false }) => {
  if (!showAlways && (!totalPages || totalPages <= 1)) return null

  const safeTotal = totalPages && totalPages > 0 ? totalPages : 1
  const safePage = Number.isFinite(page) ? page : 0

  return (
    <div className="mt-3 flex items-center justify-center gap-4">
      <Button
        variant="ghost"
        className="inline-flex size-9 items-center justify-center rounded-[10px] p-0"
        disabled={safePage <= 0}
        onClick={() => onPageChange(safePage - 1)}
      >
        <span aria-hidden="true">&lt;</span>
        <span className="absolute m-[-1px] h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]">
          Previous
        </span>
      </Button>
      <span className="min-w-[140px] text-center">
        Page {safePage + 1} of {safeTotal}
      </span>
      <Button
        variant="ghost"
        className="inline-flex size-9 items-center justify-center rounded-[10px] p-0"
        disabled={safePage >= safeTotal - 1}
        onClick={() => onPageChange(safePage + 1)}
      >
        <span aria-hidden="true">&gt;</span>
        <span className="absolute m-[-1px] h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]">
          Next
        </span>
      </Button>
    </div>
  )
}

export default Pagination
