import { Http } from '@jl-org/http'
import { getEnv, isFn, isStr } from '@jl-org/tool'
import { ProxyAgent } from 'undici'
import { LLMCodeEnum } from './types'

fetchHackProxy()

export const http = new Http({
  baseUrl: '',
  headers: {
    // 'Authorization': `Bearer ${getEnv('LLM_API_KEY')}`
  },
  timeout: 1000 * 60 * 30,
  respInterceptor(resp) {
    if (resp.rawResp.status === LLMCodeEnum.Unauthorized) {
      throw new Error('Unauthorized')
    }
    if (resp.rawResp.status === LLMCodeEnum.TooManyRequests) {
      throw new Error('TooManyRequests')
    }
    if (resp.rawResp.status === LLMCodeEnum.InternalServerError) {
      throw new Error('InternalServerError')
    }

    return resp.data
  },
  async respErrInterceptor(err) {
    if ((err as any).message) {
      console.warn((err as any).message)
      return
    }

    if (isStr(err)) {
      console.warn(err)
      return
    }

    if (err instanceof Response && isFn(err.text)) {
      const text = await err.text()
      console.warn(text)
    }
  },
})

function fetchHackProxy() {
  const proxy = getEnv('HTTP_PROXY')
  const agent = proxy
    ? new ProxyAgent(proxy)
    : undefined

  if (!agent) {
    return
  }

  const oldFetch = fetch
  globalThis.fetch = (
    input: string | URL | globalThis.Request,
    init?: RequestInit,
  ) => {
    return oldFetch(input, {
      ...init,
      // @ts-ignore
      dispatcher: agent,
    })
  }
}
