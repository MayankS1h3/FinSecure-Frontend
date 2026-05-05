import { request } from './client'

const base = '/api/holidays'

const createHoliday = (token, payload) =>
  request(`${base}`, { method: 'POST', token, body: payload })

const deleteHoliday = (token, holidayId) =>
  request(`${base}/${holidayId}`, { method: 'DELETE', token })

const getHolidays = (token, params) => request(`${base}`, { token, params })

export { createHoliday, deleteHoliday, getHolidays }
