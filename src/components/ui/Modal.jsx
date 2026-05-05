import Button from './Button'

const Modal = ({ title, children, onClose, onConfirm, confirmLabel }) => {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-5">
      <div className="w-full max-w-[520px] rounded-2xl bg-white p-5">
        <div className="flex items-center justify-between">
          <h3>{title}</h3>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="my-4">{children}</div>
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {onConfirm && (
            <Button variant="primary" onClick={onConfirm}>
              {confirmLabel || 'Confirm'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Modal
