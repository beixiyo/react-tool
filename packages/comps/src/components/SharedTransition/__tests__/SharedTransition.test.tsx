/** 验证公共配对状态隔离、无浏览器 VT 时的降级与端点生命周期 */
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { StrictMode, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { createSharedTransition, SharedTransitionProvider } from '..'
import type { SharedTransitionPair } from '../types'

/** 两端和状态使用者分别读取同一个工厂凭证 */
function PairView({ pair, label }: { pair: SharedTransitionPair; label: string }) {
  const { open, show, hide } = pair.useTransition()

  return (
    <section aria-label={ label }>
      <pair.Source>
        <input aria-label={ `${label}来源` } defaultValue="初始值" />
      </pair.Source>
      <button onClick={ () => show() }>打开{ label }</button>
      { open && (
        <pair.Target>
          <button onClick={ () => hide() }>关闭{ label }</button>
        </pair.Target>
      ) }
    </section>
  )
}

describe('共享过渡公共契约', () => {
  it('系统减少动态效果不禁用 VT，仍可通过 enabled 显式关闭', () => {
    const Pair = createSharedTransition()
    const descriptor = Object.getOwnPropertyDescriptor(document, 'startViewTransition')
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const matchMedia = vi.spyOn(window, 'matchMedia').mockReturnValue({ ...media, matches: true })
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: vi.fn() })

    function Probe() {
      const { enabled } = Pair.useTransition()
      return <output aria-label="过渡能力">{ String(enabled) }</output>
    }

    const view = render(
      <SharedTransitionProvider>
        <Probe />
      </SharedTransitionProvider>,
    )
    try {
      expect(screen.getByLabelText('过渡能力').textContent).toBe('true')
      view.rerender(
        <SharedTransitionProvider enabled={ false }>
          <Probe />
        </SharedTransitionProvider>,
      )
      expect(screen.getByLabelText('过渡能力').textContent).toBe('false')
    }
    finally {
      view.unmount()
      matchMedia.mockRestore()
      if (descriptor) Object.defineProperty(document, 'startViewTransition', descriptor)
      else Reflect.deleteProperty(document, 'startViewTransition')
    }
  })

  it('浏览器无 VT 时仍可操作，同一 Provider 中多对互不影响', () => {
    const First = createSharedTransition()
    const Second = createSharedTransition()
    render(
      <SharedTransitionProvider>
        <PairView pair={ First } label="A" />
        <PairView pair={ Second } label="B" />
      </SharedTransitionProvider>,
    )

    fireEvent.change(screen.getByLabelText('A来源'), { target: { value: '用户输入' } })
    fireEvent.click(screen.getByText('打开A'))
    fireEvent.click(screen.getByText('打开B'))
    expect(screen.getByText('关闭A')).toBeTruthy()
    expect(screen.getByText('关闭B')).toBeTruthy()

    fireEvent.click(screen.getByText('关闭A'))
    expect(screen.queryByText('关闭A')).toBeNull()
    expect(screen.getByText('关闭B')).toBeTruthy()
    expect((screen.getByLabelText('A来源') as HTMLInputElement).value).toBe('用户输入')
  })

  it('同一模块凭证在不同 Provider 和 SSR 请求间不共享可变状态', () => {
    const Pair = createSharedTransition()
    const view = render(
      <>
        <SharedTransitionProvider>
          <PairView pair={ Pair } label="左" />
        </SharedTransitionProvider>
        <SharedTransitionProvider>
          <PairView pair={ Pair } label="右" />
        </SharedTransitionProvider>
      </>,
    )
    fireEvent.click(screen.getByText('打开左'))
    expect(screen.getByText('关闭左')).toBeTruthy()
    expect(screen.queryByText('关闭右')).toBeNull()

    const html = renderToString(
      <SharedTransitionProvider>
        <PairView pair={ Pair } label="服务端" />
      </SharedTransitionProvider>,
    )
    const serverDocument = new DOMParser().parseFromString(html, 'text/html')
    expect(serverDocument.body.textContent).toContain('打开服务端')
    expect(serverDocument.body.textContent).not.toContain('关闭服务端')
    view.unmount()
  })

  it('StrictMode 下端点卸载后回收旧状态，再挂载不继承已打开状态', async () => {
    const Pair = createSharedTransition()
    function Toggle() {
      const [visible, setVisible] = useState(true)
      return (
        <SharedTransitionProvider>
          <button onClick={ () => setVisible((value) => !value) }>挂载开关</button>
          { visible && <PairView pair={ Pair } label="配对" /> }
        </SharedTransitionProvider>
      )
    }
    render(
      <StrictMode>
        <Toggle />
      </StrictMode>,
    )
    fireEvent.click(screen.getByText('打开配对'))
    expect(screen.getByText('关闭配对')).toBeTruthy()
    fireEvent.click(screen.getByText('挂载开关'))
    await act(async () => {
      await Promise.resolve()
    })
    fireEvent.click(screen.getByText('挂载开关'))
    expect(screen.queryByText('关闭配对')).toBeNull()
    fireEvent.click(screen.getByText('打开配对'))
    expect(screen.getByText('关闭配对')).toBeTruthy()
  })

  it('重复注册同一个 Source 明确报错，不悄悄选择任意端点', () => {
    const Pair = createSharedTransition()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() =>
      render(
        <SharedTransitionProvider>
          <Pair.Source>
            <span>来源一</span>
          </Pair.Source>
          <Pair.Source>
            <span>来源二</span>
          </Pair.Source>
        </SharedTransitionProvider>,
      )
    ).toThrow('A shared transition pair cannot register more than one source')
    consoleError.mockRestore()
  })

  it('未提供 Provider 时明确提示，业务更新与配对状态共同提交', async () => {
    const Pair = createSharedTransition()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Pair.Source>来源</Pair.Source>)).toThrow('SharedTransitionProvider')
    consoleError.mockRestore()

    function Business() {
      const { open, show, hide } = Pair.useTransition()
      const [value, setValue] = useState('原始')
      return (
        <section aria-label="业务">
          <span>{ value }</span>
          <button onClick={ () => show({ update: () => setValue('已打开') }) }>打开业务</button>
          { open && <button onClick={ () => hide({ update: () => setValue('已关闭') }) }>关闭业务</button> }
        </section>
      )
    }
    render(
      <SharedTransitionProvider enabled={ false }>
        <Business />
      </SharedTransitionProvider>,
    )
    const section = within(screen.getByRole('region', { name: '业务' }))
    fireEvent.click(section.getByText('打开业务'))
    expect(section.getByText('已打开')).toBeTruthy()
    fireEvent.click(section.getByText('关闭业务'))
    await waitFor(() => expect(section.getByText('已关闭')).toBeTruthy())
    expect(section.queryByText('关闭业务')).toBeNull()
  })
})
