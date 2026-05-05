import { useContext } from 'react'
import { AuthContext } from '../../auth/AuthContext'
import Button from '../ui/Button'

const TopBar = () => {
  const { user, logout } = useContext(AuthContext)
  const displayName = user?.fullName || user?.username || 'User'

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 pb-4 pt-7 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.4)] max-lg:flex-col max-lg:items-start max-lg:gap-3">
      <div>
        <p className="m-0 text-[11px] uppercase tracking-[0.2em] text-slate-500">FinSecure</p>
        <h1 className="mt-1.5 mb-0 font-display text-[26px]">Welcome {displayName}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-500">{user?.role || '-'}</span>
        </div>
        <Button variant="ghost" onClick={logout}>
          Sign out
        </Button>
      </div>
    </header>
  )
}

export default TopBar
