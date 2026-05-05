import { ROLES } from '../utils/roles'

const navItems = [
  {
    label: 'Dashboard',
    path: '/',
    roles: [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.HR, ROLES.FINANCE],
  },
  {
    label: 'Attendance',
    path: '/attendance',
    roles: [ROLES.EMPLOYEE, ROLES.MANAGER],
  },
  {
    label: 'Team Attendance',
    path: '/attendance/team',
    roles: [ROLES.MANAGER],
  },
  {
    label: 'Regularization',
    path: '/regularization',
    roles: [ROLES.EMPLOYEE, ROLES.MANAGER],
  },
  {
    label: 'Leaves',
    path: '/leaves',
    roles: [ROLES.EMPLOYEE, ROLES.MANAGER],
  },
  {
    label: 'Pending Leaves',
    path: '/leaves/pending',
    roles: [ROLES.MANAGER],
  },
  {
    label: 'Timesheet Entries',
    path: '/timesheet-entries',
    roles: [ROLES.EMPLOYEE, ROLES.MANAGER],
  },
  {
    label: 'Weekly Timesheet Entry',
    path: '/timesheet-entries/weekly',
    roles: [ROLES.EMPLOYEE],
  },
  {
    label: 'Timesheets',
    path: '/timesheets',
    roles: [ROLES.EMPLOYEE, ROLES.MANAGER],
  },
  {
    label: 'Team Timesheets',
    path: '/timesheets/team',
    roles: [ROLES.MANAGER],
  },
  {
    label: 'Holidays',
    path: '/holidays',
    roles: [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.HR, ROLES.FINANCE],
  },
]

export default navItems
