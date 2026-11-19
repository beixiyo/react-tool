/** 本文件的 fixture 故意构造不合规的 ARIA 结构来验证断言辅助，关闭对应的 a11y lint */
/* oxlint-disable jsx-a11y/prefer-tag-over-role, jsx-a11y/role-has-required-aria-props, jsx-a11y/role-supports-aria-props, jsx-a11y/aria-activedescendant-has-tabindex */
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { expectPattern, getAccessibleName, getAriaViolations } from './ariaPatterns'

/** 断言辅助本身也要能抓到问题：正例通过，典型反例各报出对应违规 */
describe('ariaPatterns 断言辅助', () => {
  it('合法的 tabs 结构通过，并识别 aria-controls / aria-labelledby 互指', () => {
    const { container } = render(
      <div>
        <div role="tablist">
          <button role="tab" id="t1" aria-selected="true" aria-controls="p1" tabIndex={ 0 }>One</button>
          <button role="tab" id="t2" aria-selected="false" aria-controls="p2" tabIndex={ -1 }>Two</button>
        </div>
        <div role="tabpanel" id="p1" aria-labelledby="t1" />
        <div role="tabpanel" id="p2" aria-labelledby="t2" />
      </div>,
    )
    expectPattern(container, 'tabs')
  })

  it('报出悬空 ID 引用、多个 Tab 停靠点与 tablist 内的非 tab 按钮', () => {
    const { container } = render(
      <div role="tablist">
        <button role="tab" aria-selected="true" aria-controls="missing" tabIndex={ 0 }>One</button>
        <button role="tab" aria-selected="false" tabIndex={ 0 }>Two</button>
        <button type="button">More</button>
      </div>,
    )
    const violations = getAriaViolations(container, 'tabs').join('\n')
    expect(violations).toMatch(/aria-controls="missing" points to missing element/)
    expect(violations).toMatch(/exactly 1 item with tabIndex=0, got 2/)
    expect(violations).toMatch(/non-tab interactive element <button role=button "More">/)
  })

  it('报出状态属性挂在不支持的 role 上', () => {
    const { container } = render(
      <div role="listbox" aria-label="Fruits">
        <div role="option" aria-selected="false">Apple</div>
        <button type="button" aria-selected="true">Bad</button>
        <div aria-expanded="false">wrapper</div>
      </div>,
    )
    const violations = getAriaViolations(container, 'listbox').join('\n')
    expect(violations).toMatch(/aria-selected is not supported on role "button"/)
    expect(violations).toMatch(/aria-expanded is not supported on role "generic"/)
  })

  it('combobox 展开时要求 aria-controls，收起时不能残留 aria-activedescendant', () => {
    const { container, rerender } = render(<div role="combobox" aria-label="Fruit" aria-expanded="true" />)
    expect(getAriaViolations(container, 'combobox').join('\n')).toMatch(/must aria-controls its popup/)

    rerender(
      <>
        <div role="combobox" aria-label="Fruit" aria-expanded="false" aria-activedescendant="o1" />
        <div role="option" id="o1">Apple</div>
      </>,
    )
    expect(getAriaViolations(container, 'combobox').join('\n')).toMatch(/stale aria-activedescendant/)
  })

  it('dialog 缺可访问名或 aria-modal、grid 单元格不在 row 内时报错', () => {
    const { container } = render(
      <>
        <div role="dialog" />
        <div role="grid" aria-label="Days">
          <div role="gridcell">
            <button type="button">1</button>
          </div>
        </div>
      </>,
    )
    expect(getAriaViolations(container, 'dialog')).toEqual(expect.arrayContaining([
      expect.stringMatching(/has no accessible name/),
      expect.stringMatching(/must set aria-modal="true"/),
    ]))
    expect(getAriaViolations(container, 'grid').join('\n')).toMatch(/is not inside a row/)
  })

  it('menuitemradio 缺 aria-checked、菜单内有多个 Tab 停靠点时报错', () => {
    const { container } = render(
      <div role="menu">
        <button role="menuitemradio">A</button>
        <button role="menuitem">B</button>
      </div>,
    )
    const violations = getAriaViolations(container, 'menu').join('\n')
    expect(violations).toMatch(/must set aria-checked/)
    expect(violations).toMatch(/2 tabbable descendants/)
  })

  it('可访问名优先 aria-labelledby，内容取名时跳过 aria-hidden 并采用子元素 aria-label', () => {
    const { getByTestId } = render(
      <>
        <span id="lbl">外部标签</span>
        <div data-testid="a" role="combobox" aria-labelledby="lbl" aria-label="被覆盖" />
        <div data-testid="b" role="gridcell">
          <span aria-hidden="true">15</span>
          <button type="button" aria-label="2026-07-15" />
        </div>
      </>,
    )
    expect(getAccessibleName(getByTestId('a'))).toBe('外部标签')
    expect(getAccessibleName(getByTestId('b'))).toBe('2026-07-15')
  })
})
