import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const publicPages = ['/verify', '/login', '/register', '/forgot-password']

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !publicPages.some(p => window.location.pathname.startsWith(p))) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export default http
