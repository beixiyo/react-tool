import type { PanelConfig, PanelState } from '../types'
import { afterEach, describe, expect, it } from 'vitest'
import {
  applyWidthConstraints,
  calculateInitialWidths,
  getDividerSize,
  loadPersistedState,
  savePersistedState,
  shouldAutoCollapse,
} from '../utils'

describe('splitPane utils', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('calculates initial widths with fixed, auto, divider and gap sizes', () => {
    const configs: PanelConfig[] = [
      { id: 'left', defaultWidth: 200, minWidth: 120 },
      { id: 'middle', defaultWidth: 'auto', minWidth: 100 },
      { id: 'right', defaultWidth: 'auto', minWidth: 100 },
    ]

    expect(calculateInitialWidths(configs, 600, 4, 8)).toEqual([200, 188, 188])
  })

  it('clamps configured widths and divider overrides', () => {
    const configs: PanelConfig[] = [
      { id: 'left', defaultWidth: 500, maxWidth: 320 },
      { id: 'right', defaultWidth: 'auto', minWidth: 150 },
    ]

    expect(calculateInitialWidths(configs, 700, 4)).toEqual([320, 376])
    expect(getDividerSize(0, 4, [10])).toBe(10)
    expect(getDividerSize(1, 4, [10])).toBe(4)
  })

  it('applies width constraints and auto collapse rules', () => {
    const config: PanelConfig = {
      id: 'left',
      minWidth: 100,
      maxWidth: 300,
      collapsedWidth: 24,
    }

    expect(applyWidthConstraints(80, config, false)).toBe(100)
    expect(applyWidthConstraints(400, config, false)).toBe(300)
    expect(applyWidthConstraints(180, config, true)).toBe(24)
    expect(shouldAutoCollapse(99, 100)).toBe(true)
    expect(shouldAutoCollapse(100, 100)).toBe(false)
    expect(shouldAutoCollapse(10, undefined)).toBe(false)
  })

  it('loads and saves persisted state safely', () => {
    const key = 'split-pane:test'
    const states: PanelState[] = [
      { width: 160, collapsed: false, widthBeforeCollapse: 160 },
      { width: 240, collapsed: true, widthBeforeCollapse: 320 },
    ]

    savePersistedState(key, states)
    expect(loadPersistedState(key)).toEqual({
      sizes: [160, 240],
      collapsedStates: [false, true],
      widthsBeforeCollapse: [160, 320],
    })

    localStorage.setItem(key, '{bad json')
    expect(loadPersistedState(key)).toBeNull()
  })
})
