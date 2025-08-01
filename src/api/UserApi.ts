import { http } from './httpInstance'

export class UserApi {
  /**
   * 退出登录
   */
  static async logout(): Promise<unknown> {
    const url = '/auth/logout'
    return http.post(url)
  }

  static async getCaptcha() {
    const url = '/captcha/img'
    return http.get<any, { img: string, uuid: string }>(url)
  }

  /**
   * 邮箱验证码
   */
  static async getCaptchaMail(query: { email: string }) {
    return http.get('/captcha/mail', { query })
  }
}
