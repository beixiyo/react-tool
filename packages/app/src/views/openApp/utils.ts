const userAgent = navigator.userAgent
const isiOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream

export function openAppStore(id: string) {
  if (isiOS) {
    window.open(`https://apps.apple.com/app/id${id}`, '_blank')
  }
}

export function openApp(config: OpenAppProps) {
  const { timeout = 2500, iosScheme, iosAppId, androidScheme, androidAppId, androidStoreUrl } = config
  const startTime = Date.now()

  if (isiOS) {
    window.location.href = iosScheme
    setTimeout(
      () => {
        if (Date.now() - startTime < timeout)
          return // 若快速返回，App已打开
        openAppStore(iosAppId)
      },
      timeout,
    )
  }
  else {
    window.location.href = androidScheme
    setTimeout(
      () => {
        if (Date.now() - startTime < timeout)
          return // 若快速返回，App已打开
        window.location.href = androidStoreUrl
      },
      timeout,
    )
  }
}

type OpenAppProps = {
  timeout?: number
  iosScheme: string
  iosAppId: string
  androidScheme: string
  androidAppId: string
  androidStoreUrl: string
}
