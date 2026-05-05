import { request } from './client'

const base = '/api/regularizations'

const createRegularization = (token, payload) =>
  request(`${base}`, { method: 'POST', token, body: payload })

const getMyRegularizations = (token, params) =>
  request(`${base}/my`, { token, params })

const getPendingRegularizations = (token) =>
  request(`${base}/pending`, { token })

const decideRegularization = (token, requestId, payload) =>
  request(`${base}/${requestId}/decision`, {
    method: 'PATCH',
    token,
    body: payload,
  })

export {
  createRegularization,
  getMyRegularizations,
  getPendingRegularizations,
  decideRegularization,
}
