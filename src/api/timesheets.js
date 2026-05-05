import { request } from './client'

const base = '/api/timesheets'

const getMyTimesheet = (token, params) =>
  request(`${base}/my`, { token, params })

const submitTimesheet = (token, timesheetId) =>
  request(`${base}/${timesheetId}/submit`, { method: 'PATCH', token })

const getPendingTimesheets = (token, params) =>
  request(`${base}/pending`, { token, params })

const getTeamTimesheets = (token, params) =>
  request(`${base}/team`, { token, params })

const decideTimesheet = (token, timesheetId, payload) =>
  request(`${base}/${timesheetId}/decision`, {
    method: 'PATCH',
    token,
    body: payload,
  })

const getDiscrepancyReport = (token, employeeId, params) =>
  request(`${base}/reports/discrepancy/${employeeId}`, { token, params })

export {
  getMyTimesheet,
  submitTimesheet,
  getPendingTimesheets,
  getTeamTimesheets,
  decideTimesheet,
  getDiscrepancyReport,
}
