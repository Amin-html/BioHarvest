import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
})

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}
export function getAccessToken() {
  return accessToken
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const { data } = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true })
  setAccessToken(data.access_token)
  return data.access_token
}

interface RetryConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined
    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null })
        }
        const newToken = await refreshPromise
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        setAccessToken(null)
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  },
)