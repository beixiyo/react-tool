import type { Resp } from '@jl-org/http'
import type { Resp as MyResp } from '@/types'
import { Http } from '@jl-org/http'
import { getLocalStorage } from '@jl-org/tool'

export const http = new Http({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  // @ts-ignore
  respInterceptor: (response: Resp<MyResp>) => {
    if (!response.data.success) {
      return Promise.reject(response.data.msg)
    }

    return response.data.data
  },

  reqInterceptor(config) {
    config.headers = {
      ...config.headers,
      authorization: getLocalStorage('token') || '',
    }
    return config
  },

  respErrInterceptor: (error: any) => {
    console.warn(error)
  },
})
