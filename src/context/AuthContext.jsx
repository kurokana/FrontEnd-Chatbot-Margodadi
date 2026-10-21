import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [operator, setOperator] = useState(() => {
    const saved = localStorage.getItem('vg_operator')
    try {
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('vg_token') || null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(async () => {
    try {
      if (token) {
        await authService.logout()
      }
    } catch {
      // Ignore network failure on logout
    } finally {
      setToken(null)
      setOperator(null)
      localStorage.removeItem('vg_token')
      localStorage.removeItem('vg_operator')
      localStorage.removeItem('vg_last_active_time')
    }
  }, [token])

  useEffect(() => {
    async function verifyAuth() {
      if (token) {
        try {
          const res = await authService.getMe()
          if (res?.data?.operator) {
            setOperator(res.data.operator)
            localStorage.setItem('vg_operator', JSON.stringify(res.data.operator))
          }
        } catch (err) {
          // Token invalid or session expired
          if (err?.response?.status === 401) {
            logout()
          }
        }
      }
      setIsLoading(false)
    }

    verifyAuth()
  }, [token, logout])

  const login = useCallback(async (identifier, password) => {
    const res = await authService.login(identifier, password)
    if (res?.data?.access_token) {
      const accessToken = res.data.access_token
      const operatorData = res.data.operator

      setToken(accessToken)
      setOperator(operatorData)
      localStorage.setItem('vg_token', accessToken)
      localStorage.setItem('vg_operator', JSON.stringify(operatorData))
      localStorage.setItem('vg_last_active_time', Date.now().toString())
      return { success: true, operator: operatorData }
    }
    throw new Error(res?.message || 'Login gagal')
  }, [])

  const updateOperator = useCallback((newOperatorData) => {
    setOperator(newOperatorData)
    localStorage.setItem('vg_operator', JSON.stringify(newOperatorData))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        operator,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        updateOperator,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
