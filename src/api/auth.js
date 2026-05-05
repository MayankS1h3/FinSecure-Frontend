import { request } from './client'

const login = (credentials) =>
  request('/finsecure/public/login', {
    method: 'POST',
    body: credentials,
  })

const signup = (payload) =>
  request('/finsecure/public/signup', {
    method: 'POST',
    body: payload,
  })

export { login, signup }
