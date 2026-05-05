import { request } from './client'

const base = '/api/leaves'

const applyLeave = (token, payload) =>
  request(`${base}`, { method: 'POST', token, body: payload })

const getMyLeaves = (token, params) => request(`${base}`, { token, params })

const cancelLeave = (token, leaveId) =>
  request(`${base}/${leaveId}/cancel`, { method: 'PATCH', token })

const processLeave = (token, leaveId, payload) =>
  request(`${base}/${leaveId}/process`, {
    method: 'PATCH',
    token,
    body: payload,
  })

const processCancelRequest = (token, leaveId, payload) =>
  request(`${base}/${leaveId}/process-cancel-request`, {
    method: 'PATCH',
    token,
    body: payload,
  })

const getPendingLeaves = (token, params) =>
  request(`${base}/pending`, { token, params })

export {
  applyLeave,
  getMyLeaves,
  cancelLeave,
  processLeave,
  processCancelRequest,
  getPendingLeaves,
}
