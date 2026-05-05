import { request } from './client'

const base = '/api/timesheet-entries'

const createEntry = (token, payload) =>
  request(`${base}`, { method: 'POST', token, body: payload })

const createWeeklyEntries = (token, payload) =>
  request(`${base}/weekly-entry`, { method: 'POST', token, body: payload })

const getEntries = (token, params) => request(`${base}`, { token, params })

const getEntriesByRange = (token, params) =>
  request(`${base}/range`, { token, params })

const updateEntry = (token, entryId, payload) =>
  request(`${base}/${entryId}`, { method: 'PUT', token, body: payload })

const deleteEntry = (token, entryId) =>
  request(`${base}/${entryId}`, { method: 'DELETE', token })

export {
  createEntry,
  createWeeklyEntries,
  getEntries,
  getEntriesByRange,
  updateEntry,
  deleteEntry,
}
