/**
 * 登录页：浮动标签表单，深色背景 + 系统色强调（使用设计 Token，无硬编码颜色）
 */
import { useSignal } from '@preact/signals-react'
import { Button } from 'comps'
import { useCallback, useState } from 'react'
import { cn } from 'utils'
import { GithubSourceLink } from '@/components/GithubSourceLink'

function FloatingLabelInput({
  value,
  onChange,
  label,
  type = 'text',
  required = false,
  invalid = false,
  onFocus,
  onBlur,
  ...rest
}: {
  value: string
  onChange: (v: string) => void
  label: string
  type?: 'text' | 'password'
  required?: boolean
  invalid?: boolean
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'>) {
  const [focused, setFocused] = useState(false)
  const floated = focused || value.length > 0

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true)
    onFocus?.(e)
  }, [onFocus])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false)
    onBlur?.(e)
  }, [onBlur])

  return (
    <div className="relative w-[300px]">
      <input
        type={ type }
        value={ value }
        onChange={ e => onChange(e.target.value) }
        onFocus={ handleFocus }
        onBlur={ handleBlur }
        required={ required }
        className={ cn(
          'w-full rounded-xl px-4 py-3 text-base outline-none transition-[border-color] duration-300',
          'border bg-transparent text-text',
          invalid
            ? 'border-danger'
            : 'border-border2 focus:border-systemOrange',
        ) }
        { ...rest }
      />
      <span
        className={ cn(
          'pointer-events-none absolute left-4 py-3 text-base uppercase tracking-wide transition-all duration-300',
          invalid ? 'text-danger' : 'text-text3',
          floated && !invalid && 'translate-x-[15px] -translate-y-5 bg-background px-[5px] text-[0.65em] tracking-wider text-systemOrange',
          floated && invalid && 'translate-x-[15px] -translate-y-5 rounded-xl border border-danger bg-background px-[5px] text-[0.65em] tracking-wider',
        ) }
      >
        { label }
      </span>
    </div>
  )
}

function LoginPage() {
  const username = useSignal('')
  const password = useSignal('')
  const usernameInvalid = useSignal(false)
  const passwordInvalid = useSignal(false)

  const handleUsernameChange = useCallback((v: string) => {
    username.value = v
    if (usernameInvalid.value)
      usernameInvalid.value = false
  }, [])

  const handlePasswordChange = useCallback((v: string) => {
    password.value = v
    if (passwordInvalid.value)
      passwordInvalid.value = false
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const uInvalid = !username.value.trim()
    const pInvalid = password.value.length < 2
    usernameInvalid.value = uInvalid
    passwordInvalid.value = pInvalid
    if (uInvalid || pInvalid)
      return
    // @TODO 调用登录 API，写入 token 后跳转
  }, [])

  return (
    <div className="dark flex min-h-screen flex-col items-center justify-center gap-5 select-none bg-background">
      <h2 className="text-text text-xl font-semibold">用户登录</h2>
      <form onSubmit={ handleSubmit } className="flex flex-col items-center gap-5">
        <FloatingLabelInput
          value={ username.value }
          onChange={ handleUsernameChange }
          label="用户名"
          required
          invalid={ usernameInvalid.value }
          autoComplete="username"
        />
        <FloatingLabelInput
          value={ password.value }
          onChange={ handlePasswordChange }
          label="密码"
          type="password"
          required
          minLength={ 2 }
          invalid={ passwordInvalid.value }
          autoComplete="current-password"
        />

        <div className="pt-1">
          <Button
            variant="primary"
            type="submit"
          >
            登录
          </Button>
        </div>
      </form>

      <GithubSourceLink />
    </div>
  )
}

export default LoginPage
