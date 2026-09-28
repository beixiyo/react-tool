export function getBrowserLocale(fallback: string = 'en-US') {
  if (typeof navigator === 'undefined') {
    return fallback
  }

  return navigator.language || navigator.languages?.[0] || fallback
}
