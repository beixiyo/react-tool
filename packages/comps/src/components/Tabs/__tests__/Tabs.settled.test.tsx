/** Tab 的原生 transform 过渡通知契约；不依赖模拟 DOM 几何。 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { TabsContent } from '../subcomponents/TabsContent'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const items = [{ value: 'first', children: 'First body' }, { value: 'second', children: 'Second body' }]

it('切页等待轨道 transform 结束，忽略子节点、其他属性和重复事件', () => {
  const settled = vi.fn()
  const view = render(<TabsContent items={ items } activeValue="first" mode="none" onActiveValueSettled={ settled } />)
  expect(settled.mock.calls).toEqual([['first']])

  view.rerender(<TabsContent items={ items } activeValue="second" mode="none" onActiveValueSettled={ settled } />)
  expect(settled).toHaveBeenCalledTimes(1)

  const panel = screen.getByText('Second body')
  const track = panel.parentElement!
  transitionEnd(panel, 'transform')
  transitionEnd(track, 'opacity')
  expect(settled).toHaveBeenCalledTimes(1)

  transitionEnd(track, 'transform')
  transitionEnd(track, 'transform')
  expect(settled.mock.calls).toEqual([['first'], ['second']])
})

it('无动画直接通知，不创建逐帧观察；重新渲染回调不重复通知', () => {
  const requestFrame = vi.spyOn(window, 'requestAnimationFrame')
  const settled = vi.fn()
  const view = render(<TabsContent items={ items } activeValue="first" duration={ 0 } mode="none" onActiveValueSettled={ value => settled(value) } />)
  view.rerender(<TabsContent items={ items } activeValue="second" duration={ 0 } mode="none" onActiveValueSettled={ value => settled(value) } />)
  view.rerender(<TabsContent items={ items } activeValue="second" duration={ 0 } mode="none" onActiveValueSettled={ value => settled(value) } />)

  expect(settled.mock.calls).toEqual([['first'], ['second']])
  expect(requestFrame).not.toHaveBeenCalled()
})

it('通知抛错或拒绝不影响目标内容，取消的切换不在后续重复通知', async () => {
  const rejected = vi.fn().mockRejectedValue(new Error('controlled rejection'))
  const view = render(<TabsContent items={ items } activeValue="first" mode="none" onActiveValueSettled={ rejected } />)
  await Promise.resolve()
  view.rerender(<TabsContent items={ items } activeValue="second" mode="none" onActiveValueSettled={ rejected } />)
  view.rerender(<TabsContent items={ items } activeValue="first" mode="none" onActiveValueSettled={ () => { throw new Error('controlled observer') } } />)

  const panel = screen.getByText('First body')
  expect(() => transitionEnd(panel.parentElement!, 'transform')).not.toThrow()
  expect(panel).toBeTruthy()
  expect(rejected.mock.calls).toEqual([['first']])
})

function transitionEnd(element: Element, propertyName: string) {
  const event = new Event('transitionend', { bubbles: true })
  Object.defineProperty(event, 'propertyName', { value: propertyName })
  fireEvent(element, event)
}
