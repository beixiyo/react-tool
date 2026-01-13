export type MockConfig = {
  enabled: boolean
  sseIntervalMs?: number
  apiDelayMs?: number
}

export const mockConfig: MockConfig = {
  enabled: false,
  sseIntervalMs: 80,
  apiDelayMs: 500,
}

export function setMockConfig(patch: Partial<MockConfig>) {
  Object.assign(mockConfig, patch)
}
