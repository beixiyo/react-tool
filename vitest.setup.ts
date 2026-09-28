import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

class ResizeObserverMock implements ResizeObserver {
  observe() {}

  unobserve() {}

  disconnect() {}
}

class IntersectionObserverMock implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds = []

  disconnect() {}

  observe() {}

  takeRecords() {
    return []
  }

  unobserve() {}
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverMock,
})

Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  value: IntersectionObserverMock,
})

Element.prototype.scrollIntoView = vi.fn()

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  localStorage.clear()
  sessionStorage.clear()
  document.cookie.split(';').forEach((cookie) => {
    const key = cookie.split('=')[0]?.trim()
    if (key) {
      document.cookie = `${key}=; path=/; max-age=0`
    }
  })
  window.history.replaceState(null, '', '/')
})
