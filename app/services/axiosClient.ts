import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import axios from 'axios'
// import i18next from "i18next";
import { redirect } from 'react-router'
// import { showToast } from "~/hooks/useShowToast";
// import { clearAuthInfo } from "~/redux/auth/authSlice";
// import { store } from "~/redux/store";
import { toCamelCase, toSnakeCase } from '~/utils/appUtils'
import StorageHelper from '~/utils/storageHelper'

interface ErrorResponse {
  status: string
  message: string
  errors?: Record<string, string[]>
}

class AxiosClient {
  private instance: AxiosInstance

  constructor() {
    console.log('AxiosClient initialized with base URL:', import.meta.env.VITE_API_SERVER_URL)

    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_SERVER_URL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers['Auth-Token'] = `${token}`
        }

        if (config.data && !(config.data instanceof FormData)) {
          config.data = toSnakeCase(config.data)
        }

        if (config.params && typeof config.params === 'object') {
          config.params = toSnakeCase(config.params)
        }

        return config
      },
      (error: AxiosError) => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (response.data && typeof response.data === 'object') {
          response.data = toCamelCase(response.data)
        }

        return response
      },
      (error: AxiosError<ErrorResponse>) => {
        this.handleError(error)
        return Promise.reject(error)
      }
    )
  }

  private getToken(): string | null {
    return StorageHelper.getCookie('token')
  }

  private handleError(error: AxiosError<ErrorResponse>): void {
    const { response, request, message: errorMessage } = error

    if (response) {
      const { data } = response

      this.showError(data?.status)

      // Handle unauthorized access and redirect to login
      if (data && data?.status === 'unauthorized') {
        this.handleUnauthorized()
      }
    }
  }

  private showError(errorKey: string): void {
    console.log('Show error for key:', errorKey)

    // Translate the error message using i18next
    // const translatedMessage = i18next.t(`errors.${errorKey}`);

    // showToast("error", translatedMessage);
  }

  private handleUnauthorized(): void {
    const currentPath = window.location.pathname
    let consolePath = 'admin' // default

    if (currentPath.startsWith('/diving')) {
      consolePath = 'diving'
    }
    // showToast("error", i18next.t("errors.unauthorized"));

    // store.dispatch(clearAuthInfo());

    // window.location.href = `/${consolePath}/login`;
    // redirect(`/${consolePath}/login`);
    // Clear auth data
  }

  // Set authorization token
  public setToken(token: string): void {
    StorageHelper.setCookie('token', token)
    this.instance.defaults.headers['Auth-Token'] = token
  }

  // Remove authorization token
  public removeToken(): void {
    StorageHelper.removeCookie('token')
    delete this.instance.defaults.headers['Auth-Token']
  }

  // Get axios instance for usage
  public getInstance(): AxiosInstance {
    return this.instance
  }
}

// Create and export singleton instance
const axiosClient = new AxiosClient()

// Export the axios instance directly
export default axiosClient.getInstance()

// Export utility methods
export const { setToken, removeToken } = axiosClient
