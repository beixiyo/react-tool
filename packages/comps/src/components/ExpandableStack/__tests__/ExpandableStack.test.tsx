import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ExpandableStack } from '../ExpandableStack'

const items = [{ id: 'x' }, { id: 'y' }]

function renderStack(props: Partial<React.ComponentProps<typeof ExpandableStack>> = {}) {
  return render(
    <ExpandableStack
      items={ items }
      renderCollapsed={ item => <span>{ `collapsed-${item.id}` }</span> }
      renderExpanded={ (item, _index, close) => (
        <button type="button" onClick={ close }>{ `expanded-${item.id}` }</button>
      ) }
      { ...props }
    />,
  )
}

describe('ExpandableStack 受控 / 非受控', () => {
  it('非受控：点击收起项展开，展开内容可关闭', () => {
    const onExpandedChange = vi.fn()
    renderStack({ onExpandedChange })

    fireEvent.click(screen.getByText('collapsed-x'))
    expect(screen.getByText('expanded-x')).toBeTruthy()

    fireEvent.click(screen.getByText('expanded-x'))
    expect(screen.getByText('collapsed-x')).toBeTruthy()
    expect(onExpandedChange.mock.calls).toEqual([['x'], [null]])
  })

  it('受控：只通知上层，展开项以 expandedId 为准', () => {
    const onExpandedChange = vi.fn()
    const { rerender } = renderStack({ expandedId: null, onExpandedChange })

    fireEvent.click(screen.getByText('collapsed-y'))
    expect(onExpandedChange.mock.calls).toEqual([['y']])
    expect(screen.queryByText('expanded-y')).toBeNull()

    rerender(
      <ExpandableStack
        items={ items }
        expandedId="y"
        onExpandedChange={ onExpandedChange }
        renderCollapsed={ item => <span>{ `collapsed-${item.id}` }</span> }
        renderExpanded={ item => <span>{ `expanded-${item.id}` }</span> }
      />,
    )
    expect(screen.getByText('expanded-y')).toBeTruthy()
  })
})
