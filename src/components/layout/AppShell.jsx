import { useContext } from 'react'
import { Outlet } from 'react-router-dom'
import { AuthContext } from '../../auth/AuthContext'
import SideNav from './SideNav'
import TopBar from './TopBar'

const AppShell = () => {
  const { user } = useContext(AuthContext)

  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] max-lg:grid-cols-1">
      <SideNav role={user?.role} />
      <main className="flex min-h-screen flex-col bg-[linear-gradient(135deg,#f4f7f9_0%,#eef3f7_100%)]">
        <TopBar />
        <div className="flex flex-col gap-6 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AppShell
