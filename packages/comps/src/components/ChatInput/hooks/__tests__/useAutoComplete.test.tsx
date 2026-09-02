import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { AutoCompleteSuggestion } from '../../types'
import { useAutoComplete } from '../useAutoComplete'

describe('useAutoComplete', () => {
  it('不会让较早的异步搜索结果覆盖最新输入', async () => {
    const first = deferred<AutoCompleteSuggestion[]>()
    const second = deferred<AutoCompleteSuggestion[]>()
    const latestSuggestion: AutoCompleteSuggestion = {
      text: 'latest result',
      type: 'keyword',
    }

    const { result } = renderHook(() =>
      useAutoComplete({
        enabled: true,
        templates: [],
        histories: [],
        adapter: {
          search: (query) =>
            query === 'first'
              ? first.promise
              : second.promise,
        },
      })
    )

    let firstSearch: Promise<void>
    let secondSearch: Promise<void>
    act(() => {
      firstSearch = result.current.generateSuggestions('first')
      secondSearch = result.current.generateSuggestions('second')
    })

    await act(async () => {
      second.resolve([latestSuggestion])
      await secondSearch
    })

    expect(result.current.suggestions).toEqual([latestSuggestion])
    expect(result.current.loading).toBe(false)

    await act(async () => {
      first.resolve([{ text: 'stale result', type: 'keyword' }])
      await firstSearch
    })

    expect(result.current.suggestions).toEqual([latestSuggestion])
    expect(result.current.selectedIndex).toBe(0)
  })
})

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((complete) => {
    resolve = complete
  })

  return { promise, resolve }
}
