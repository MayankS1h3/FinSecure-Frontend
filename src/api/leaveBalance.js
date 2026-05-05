import { request } from './client'

const base = '/api/leave-balance'

const getMyBalance = (token, params) =>
  request(`${base}/my`, { token, params })

const getEmployeeBalance = (token, employeeId, params) =>
  request(`${base}/employee/${employeeId}`, { token, params })

const getTeamBalances = (token, params) =>
  request(`${base}/team`, { token, params })

export { getMyBalance, getEmployeeBalance, getTeamBalances }
