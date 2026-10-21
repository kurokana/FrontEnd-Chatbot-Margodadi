import axios from 'axios'

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '')

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request Interceptor: Attach Sanctum Bearer Token and handle FormData
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vg_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Crucial for FormData file uploads: let browser/axios generate multipart boundary automatically
    if (config.data instanceof FormData) {
      if (typeof config.headers?.delete === 'function') {
        config.headers.delete('Content-Type')
        config.headers.delete('content-type')
      }
      if (config.headers) {
        delete config.headers['Content-Type']
        delete config.headers['content-type']
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('vg_token')
      localStorage.removeItem('vg_operator')
      localStorage.removeItem('vg_last_active_time')
      // Only redirect if inside an admin route and not already on /login
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/login') {
        const isIdleTimeout = error.response?.data?.code === 'IDLE_TIMEOUT'
        const reason = isIdleTimeout ? 'idle_timeout' : 'session_expired'
        window.location.href = `/login?reason=${reason}`
      }
    }
    return Promise.reject(error)
  }
)

export default api
