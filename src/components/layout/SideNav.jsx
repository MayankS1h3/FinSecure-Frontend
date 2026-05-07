import { NavLink } from 'react-router-dom'
import navItems from '../../data/nav'

const SideNav = ({ role }) => {
  return (
    <aside className="flex flex-col gap-6 bg-slate-900 px-5 py-7 text-slate-200 max-lg:flex-row max-lg:items-center max-lg:gap-3 max-lg:overflow-x-auto">
      <div className="w-[50px] rounded-[14px] bg-slate-800 px-3.5 py-2.5 text-center font-display text-xl">FS</div>
      <nav className="flex flex-col gap-1.5 max-lg:flex-row max-lg:flex-nowrap">
        {navItems
          .filter((item) => item.roles.includes(role))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2.5 text-indigo-200 transition-all duration-200 hover:bg-blue-500/20 hover:text-white ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]'
                    : ''
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  )
}

export default SideNav
