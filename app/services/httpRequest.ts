import type { AxiosRequestConfig, AxiosResponse } from 'axios'
// import i18next from 'i18next';
// import { showToast } from '~/hooks/useShowToast';
import axiosClient from '~/services/axiosClient'

// Define a generic ApiResponse interface for consistent API responses
interface ApiResponse<T = any> {
  status: string
  data: T
  message?: string
  errors?: Record<string, string[]>
  meta?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}

class HttpRequest {
  // GET method
  // config: params, headers,responseType etc.
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await axiosClient.get<T>(url, config)
  }

  // POST method
  async post<T = any>(
    url: string,
    data?: any,
    successMessage?: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const response = await axiosClient.post<T>(url, data, config)
    if (successMessage) {
      // showToast('success', `${i18next.t(`toasts.${successMessage}`)}`);
    }
    return response
  }

  // PUT method
  async put<T = any>(
    url: string,
    data?: any,
    successMessage?: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const response = await axiosClient.put<T>(url, data, config)
    if (successMessage) {
      // showToast('success', `${i18next.t(`toasts.${successMessage}`)}`);
    }
    return response
  }

  // PATCH method
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return await axiosClient.patch<T>(url, data, config)
  }

  // DELETE method
  async delete<T = any>(
    url: string,
    data?: any,
    successMessage?: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const mergedConfig: AxiosRequestConfig = {
      ...config,
      data
    }
    const response = await axiosClient.delete<T>(url, mergedConfig)
    if (successMessage) {
      // showToast('success', `${i18next.t(`toasts.${successMessage}`)}`);
    }
    return response
  }

  // UPLOAD method
  async upload<T = any>(
    url: string,
    data: FormData,
    successMessage?: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const response = await axiosClient.post<T>(url, data, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers
      }
    })

    if (successMessage) {
      // showToast('success', `${i18next.t(`toasts.${successMessage}`)}`);
    }

    return response
  }
}

// Create and export singleton instance
const httpRequest = new HttpRequest()
export default httpRequest

// Export for direct usage
export { httpRequest }

// Export types
export type { ApiResponse }
