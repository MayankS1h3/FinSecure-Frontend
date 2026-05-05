import { createContext, useCallback, useMemo, useState } from 'react'
import { login as loginRequest, signup as signupRequest } from '../api/auth'
import { getToken, getUser, setToken, setUser } from '../utils/storage'

const AuthContext = createContext(null)

const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(() => getToken())
  const [user, setUserState] = useState(() => getUser())

  const handleAuth = useCallback((payload) => {
    const nextToken = payload?.token || payload?.jwt || payload?.accessToken
    const resolvedName =
      payload?.fullName ||
      payload?.name ||
      payload?.employeeName ||
      [payload?.firstName, payload?.lastName].filter(Boolean).join(' ').trim()

    const nextUser = {
      username: payload?.username || payload?.email || 'User',
      fullName: resolvedName || payload?.username || payload?.email || 'User',
      role: payload?.role || payload?.userRole,
    }

    setTokenState(nextToken)
    setUserState(nextUser)
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const login = useCallback(async (credentials) => {
    const response = await loginRequest(credentials)
    handleAuth(response)
    return response
  }, [handleAuth])

  const signup = useCallback(async (payload) => {
    const response = await signupRequest(payload)
    return response
  }, [])

  const logout = useCallback(() => {
    setTokenState(null)
    setUserState(null)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      signup,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [token, user, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
