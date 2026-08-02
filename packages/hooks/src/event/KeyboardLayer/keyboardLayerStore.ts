/**
 * 全局键盘交互层栈
 *
 * store 只把事件交给优先级最高的活动层，避免嵌套浮层同时响应同一次按键
 */

let layers: KeyboardLayerEntry[] = []
let listening = false
let order = 0
const listeners = new Set<Listener>()

function emit() {
  for (const listener of listeners)
    listener()
}

function getTopLayer() {
  let topLayer: KeyboardLayerEntry | undefined

  for (const layer of layers) {
    const options = layer.getOptions()
    if (!options.active)
      continue
    if (
      !topLayer
      || options.priority > topLayer.getOptions().priority
      || (options.priority === topLayer.getOptions().priority && layer.order > topLayer.order)
    ) {
      topLayer = layer
    }
  }

  return topLayer
}

function handleKeydown(event: KeyboardEvent) {
  const layer = getTopLayer()
  if (!layer)
    return

  const options = layer.getOptions()
  if (!options.matches(event))
    return

  if (options.consume) {
    event.preventDefault()
    event.stopPropagation()
  }

  if (options.handlerEnabled && (options.allowRepeat || !event.repeat))
    options.onKeyDown?.(event)
}

function syncListener() {
  if (typeof document === 'undefined')
    return

  const shouldListen = !!getTopLayer()
  if (shouldListen === listening)
    return

  listening = shouldListen
  if (shouldListen)
    document.addEventListener('keydown', handleKeydown, true)
  else
    document.removeEventListener('keydown', handleKeydown, true)
}

export const keyboardLayerStore = {
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  getSnapshot() {
    return getTopLayer()?.id
  },

  register(entry: KeyboardLayerEntry) {
    if (entry.getOptions().active)
      entry.order = ++order
    layers = layers.some(layer => layer.id === entry.id)
      ? layers
      : [...layers, entry]
    syncListener()
    emit()
  },

  refresh() {
    syncListener()
    emit()
  },

  /** 仅在 inactive → active 时提升同优先级层的顺序 */
  activate(id: symbol) {
    const layer = layers.find(item => item.id === id)
    if (!layer || !layer.getOptions().active)
      return

    layer.order = ++order
    syncListener()
    emit()
  },

  unregister(id: symbol) {
    if (!layers.some(layer => layer.id === id))
      return

    layers = layers.filter(layer => layer.id !== id)
    syncListener()
    emit()
  },
}

interface KeyboardLayerEntry {
  id: symbol
  order: number
  getOptions: () => KeyboardLayerOptions
}

interface KeyboardLayerOptions {
  active: boolean
  priority: number
  matches: (event: KeyboardEvent) => boolean
  onKeyDown?: (event: KeyboardEvent) => void
  handlerEnabled: boolean
  allowRepeat: boolean
  consume: boolean
}

type Listener = () => void
