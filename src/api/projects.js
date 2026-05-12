import { request } from './client'

const base = '/project'

const getProjectsForTimesheetEntryDropdown = (token) =>
  request(`${base}`, { token })

export { getProjectsForTimesheetEntryDropdown }
