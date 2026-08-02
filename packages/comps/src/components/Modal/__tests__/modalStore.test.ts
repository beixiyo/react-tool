import { describe, expect, it } from 'vitest'
import { Z } from '../../../constants/z-index'
import { modalStore } from '../modalStore'

describe('modalStore', () => {
  it('使用真实视觉 z-index 决定栈顶', () => {
    const highId = modalStore.nextId()
    const lowId = modalStore.nextId()

    modalStore.open(highId, 5000)
    modalStore.open(lowId, 100)

    expect(modalStore.isTop(highId)).toBe(true)
    expect(modalStore.isTop(lowId)).toBe(false)

    modalStore.close(highId)
    modalStore.close(lowId)
  })

  it('自动层级不越过 Popover，并在栈清空后复位', () => {
    const ids = Array.from({ length: 110 }, () => modalStore.nextId())
    const zIndexes = ids.map(id => modalStore.open(id))

    expect(Math.max(...zIndexes)).toBe(Z.popover - 1)

    ids.forEach(id => modalStore.close(id))
    const nextId = modalStore.nextId()
    expect(modalStore.open(nextId)).toBe(Z.modal + 1)
    modalStore.close(nextId)
  })
})
