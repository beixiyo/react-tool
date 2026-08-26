import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { VirtualGroupList } from '../VirtualGroupList'

describe('VirtualGroupList 公共属性', () => {
  it('将 contentClassName 透传到虚拟内容容器', () => {
    const { container } = render(
      <VirtualGroupList
        sections={ [] }
        renderItem={ () => null }
        contentClassName="virtual-content"
      />,
    )

    expect(container.querySelector('.virtual-content')).toBeTruthy()
  })
})
