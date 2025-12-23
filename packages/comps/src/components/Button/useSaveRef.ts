import { useButtonGroup } from './ButtonGroupContext'

export function useSaveRef(
  ref: React.ForwardedRef<HTMLButtonElement>,
  name?: string,
  isInButtonGroup?: boolean,
) {
  /** 本地 ref，用于向 ButtonGroup 注册真实 DOM 元素 */
  const elementRef = useRef<HTMLButtonElement | null>(null)
  const buttonGroupContext = useButtonGroup()

  /** 合并转发 ref（forwardRef）与本地 ref，并在注册上下文时回调 */
  const setRef = (node: HTMLButtonElement | null) => {
    elementRef.current = node
    if (typeof ref === 'function') {
      ref(node)
    }
    else if (ref) {
      try {
        ref.current = node
      }
      catch (e) {
        // ignore
      }
    }

    if (isInButtonGroup && name) {
      try {
        buttonGroupContext?.register?.(name, node)
      }
      catch (err) {
        // ignore
      }
    }
  }

  /** 在卸载时注销注册信息 */
  useEffect(() => {
    return () => {
      if (isInButtonGroup && name) {
        try {
          buttonGroupContext?.unregister?.(name)
        }
        catch (err) {
          // ignore
        }
      }
    }
  }, [isInButtonGroup, name])

  return { setRef }
}
