import axios, { AxiosError } from "axios"

import { clearAuthStorage, getToken } from "@/lib/auth-storage"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
})

api.interceptors.request.use((config) => {
  config.headers["ngrok-skip-browser-warning"] = "true"

  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuthStorage()
      window.dispatchEvent(new Event("auth:unauthorized"))
    }
    return Promise.reject(error)
  }
)

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
    }

    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message

    if (error.response.status >= 500) {
      return "O servidor não conseguiu concluir a operação. Tente novamente em instantes."
    }

    return "Não foi possível concluir a operação. Revise as informações e tente novamente."
  }

  return "Não foi possível concluir a operação."
}
