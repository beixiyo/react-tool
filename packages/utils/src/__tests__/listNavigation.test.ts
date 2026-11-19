import { describe, expect, it } from 'vitest'
import { findTypeaheadIndex, getBoundaryEnabledIndex, getNextEnabledIndex } from '../keyboard/listNavigation'

const disabledSet = (...indexes: number[]) => (index: number) => indexes.includes(index)

describe('getNextEnabledIndex', () => {
  it('跳过 disabled 项', () => {
    expect(getNextEnabledIndex({ count: 4, current: 0, direction: 1, isDisabled: disabledSet(1) })).toBe(2)
    expect(getNextEnabledIndex({ count: 4, current: 3, direction: -1, isDisabled: disabledSet(2, 1) })).toBe(0)
  })

  it('不循环时到头停在当前项', () => {
    expect(getNextEnabledIndex({ count: 3, current: 2, direction: 1 })).toBe(2)
    expect(getNextEnabledIndex({ count: 3, current: 1, direction: 1, isDisabled: disabledSet(2) })).toBe(1)
  })

  it('循环时绕回另一端并跳过 disabled', () => {
    expect(getNextEnabledIndex({ count: 3, current: 2, direction: 1, loop: true })).toBe(0)
    expect(getNextEnabledIndex({ count: 4, current: 0, direction: -1, loop: true, isDisabled: disabledSet(3) })).toBe(2)
  })

  it('当前项无效时返回方向端点', () => {
    expect(getNextEnabledIndex({ count: 3, current: -1, direction: 1, isDisabled: disabledSet(0) })).toBe(1)
    expect(getNextEnabledIndex({ count: 3, current: -1, direction: -1 })).toBe(2)
  })

  it('没有可用项时返回 -1', () => {
    expect(getNextEnabledIndex({ count: 2, current: -1, direction: 1, isDisabled: () => true })).toBe(-1)
    expect(getNextEnabledIndex({ count: 0, current: 0, direction: 1 })).toBe(-1)
  })
})

describe('getBoundaryEnabledIndex', () => {
  it('Home / End 跳过 disabled', () => {
    expect(getBoundaryEnabledIndex(4, 1, disabledSet(0))).toBe(1)
    expect(getBoundaryEnabledIndex(4, -1, disabledSet(3))).toBe(2)
  })
})

describe('findTypeaheadIndex', () => {
  const labels = ['Apple', 'Avocado', 'Banana', 'Blueberry', 'Cherry']
  const getLabel = (index: number) => labels[index]

  it('单字符从当前项之后查找', () => {
    expect(findTypeaheadIndex({ query: 'b', count: labels.length, current: 0, getLabel })).toBe(2)
    expect(findTypeaheadIndex({ query: 'a', count: labels.length, current: 0, getLabel })).toBe(1)
    expect(findTypeaheadIndex({ query: 'a', count: labels.length, current: 1, getLabel })).toBe(0)
  })

  it('重复同一字符在同首字母项之间轮换', () => {
    expect(findTypeaheadIndex({ query: 'bb', count: labels.length, current: 2, getLabel })).toBe(3)
  })

  it('多字符前缀包含当前项，继续输入不跳走', () => {
    expect(findTypeaheadIndex({ query: 'blu', count: labels.length, current: 3, getLabel })).toBe(3)
    expect(findTypeaheadIndex({ query: 'ch', count: labels.length, current: -1, getLabel })).toBe(4)
  })

  it('跳过 disabled 且未命中返回 -1', () => {
    expect(findTypeaheadIndex({ query: 'b', count: labels.length, current: 0, getLabel, isDisabled: disabledSet(2) })).toBe(3)
    expect(findTypeaheadIndex({ query: 'z', count: labels.length, current: 0, getLabel })).toBe(-1)
  })
})
