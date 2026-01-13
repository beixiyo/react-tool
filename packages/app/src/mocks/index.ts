import { worker } from './browser'
import { mockConfig, setMockConfig, type MockConfig } from './config'

export async function initMock(config?: Partial<MockConfig>) {
  if (config) setMockConfig(config)
  if (!mockConfig.enabled) return

  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })
}

export function stopMock() {
  worker.stop()
}

export { mockConfig, setMockConfig }
export type { MockConfig }
