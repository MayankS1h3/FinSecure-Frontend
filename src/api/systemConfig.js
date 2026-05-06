import { request } from './client'

const getSystemConfigs = (token) => request('/system-config', { token })

const updateSystemConfig = (token, configKey, configValue) =>
  request(`/system-config/${configKey}`, {
    method: 'PUT',
    token,
    body: { configValue },
  })

export { getSystemConfigs, updateSystemConfig }
