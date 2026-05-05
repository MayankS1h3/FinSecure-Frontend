const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  HR: 'HR',
  FINANCE: 'FINANCE',
  ADMIN: 'ADMIN',
  SYSTEM: 'SYSTEM',
}

const isManager = (role) => role === ROLES.MANAGER

const isHr = (role) => role === ROLES.HR

const isFinance = (role) => role === ROLES.FINANCE

export { ROLES, isManager, isHr, isFinance }
