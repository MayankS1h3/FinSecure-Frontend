const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085'

const buildQuery = (params = {}) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }
    search.set(key, String(value))
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

const request = async (path, options = {}) => {
  const {
    method = 'GET',
    body,
    token,
    params,
    headers: customHeaders = {},
  } = options

  const url = `${API_BASE_URL}${path}${buildQuery(params)}`
  const headers = {
    Accept: 'application/json',
    ...customHeaders,
  }

  if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error(`Cannot reach backend at ${API_BASE_URL}`)
  }

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const message = payload?.message || payload?.error || response.statusText
    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

export { API_BASE_URL, request }
