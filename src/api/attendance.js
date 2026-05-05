import { request } from './client'

const base = '/api/attendance'

const punchIn = (token) => request(`${base}/punch-in`, { method: 'POST', token })

const punchOut = (token) =>
  request(`${base}/punch-out`, { method: 'POST', token })

const getMyAttendance = (token, params) =>
  request(`${base}`, { token, params })

const getAttendanceByDate = (token, date) =>
  request(`${base}/date/${date}`, { token })

const getMyMonthlyReport = (token, params) =>
  request(`${base}/report/monthly/me`, { token, params })

const getEmployeeMonthlyReport = (token, employeeId, params) =>
  request(`${base}/report/monthly/${employeeId}`, { token, params })

const getEmployeeAttendance = (token, employeeId, params) =>
  request(`${base}/employee/${employeeId}`, { token, params })

const getAllAttendance = (token, params) =>
  request(`${base}/all`, { token, params })

const getTeamDailyReport = (token, params) =>
  request(`${base}/report/team/daily`, { token, params })

export {
  punchIn,
  punchOut,
  getMyAttendance,
  getAttendanceByDate,
  getMyMonthlyReport,
  getEmployeeMonthlyReport,
  getEmployeeAttendance,
  getAllAttendance,
  getTeamDailyReport,
}
