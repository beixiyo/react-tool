/**
 * 全局 Escape 浮层栈
 *
 * 组件只负责注册自身的打开状态和关闭行为，store 统一保证一次 Escape
 * 最多交给一个栈顶浮层处理
 */

let layers: EscapeLayerEntry[] = []
let listening = false
const listeners = new Set<Listener>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

function getTopLayer() {
  return layers.at(-1)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') {
    return
  }

  const layer = getTopLayer()
  if (!layer) {
    return
  }

  if (layer.consume) {
    event.preventDefault()
    event.stopPropagation()
  }

  if (layer.dismissible) {
    layer.onEscape?.(event)
  }
}

function syncListener() {
  if (typeof document === 'undefined') {
    return
  }

  const shouldListen = layers.length > 0
  if (shouldListen === listening) {
    return
  }

  listening = shouldListen
  if (shouldListen) {
    document.addEventListener('keydown', handleKeydown, true)
  }
  else {
    document.removeEventListener('keydown', handleKeydown, true)
  }
}

export const escapeLayerStore = {
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  getSnapshot() {
    return getTopLayer()?.id
  },

  register(entry: EscapeLayerEntry) {
    layers = layers.some(layer => layer.id === entry.id)
      ? layers
      : [...layers, entry]
    syncListener()
    emit()
  },

  update(id: symbol, options: EscapeLayerOptions) {
    const layer = layers.find(item => item.id === id)
    if (!layer) {
      return
    }

    layer.onEscape = options.onEscape
    layer.dismissible = options.dismissible
    layer.consume = options.consume
  },

  unregister(id: symbol) {
    if (!layers.some(layer => layer.id === id)) {
      return
    }

    layers = layers.filter(layer => layer.id !== id)
    syncListener()
    emit()
  },
}

interface EscapeLayerEntry extends EscapeLayerOptions {
  id: symbol
}

interface EscapeLayerOptions {
  onEscape?: (event: KeyboardEvent) => void
  dismissible: boolean
  consume: boolean
}

type Listener = () => void
