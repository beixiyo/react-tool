export interface Resp<T = any> {
  success: boolean
  code: number
  msg: string
  data: T
  timestamp: number
}

export type PageParams<T> = {
  pageNum: number
  pageSize: number
} & T

export type PageResp<T, O> = {
  total: number
  list: T[]
} & O
