import type { ChangeEvent, ClipboardEvent as ReactClipboardEvent } from 'react'
import type { Size } from '../../types'
import type { TextareaCounterProps } from './TextareaCounter'

export type TextareaProps
  = Omit<React.PropsWithChildren<React.TextareaHTMLAttributes<HTMLTextAreaElement>>, 'onPaste' | 'onChange' | 'value'>
    & {
    /**
     * 占位文本
     */
      placeholder?: string
      /**
       * 是否禁用
       * @default false
       */
      disabled?: boolean
      /**
       * 是否为只读
       * @default false
       */
      readOnly?: boolean
      /**
       * 是否自动调整高度
       * @default false
       */
      autoResize?: boolean
      /**
       * 最大字符数
       */
      maxLength?: number
      /**
       * 是否显示字符计数
       * @default false
       */
      showCount?: boolean
      /**
       * 错误状态
       * @default false
       */
      error?: boolean
      /**
       * 错误信息
       */
      errorMessage?: string
      /**
       * 是否必填
       * @default false
       */
      required?: boolean
      /**
       * 禁用时的类名
       */
      disabledClass?: string
      /**
       * 禁用时的容器类名
       */
      disabledContainerClass?: string
      /**
       * 聚焦时的类名
       */
      focusClass?: string
      /**
       * 聚焦时的容器类名
       */
      focusContainerClass?: string
      /**
       * 错误时的类名
       */
      errorClass?: string
      /**
       * 错误时的容器类名
       */
      errorContainerClass?: string
      /**
       * 类名
       */
      focusedClassName?: string
      /**
       * 容器类名
       */
      containerClassName?: string
      /**
       * 输入容器类名，用于覆盖内部包裹 textarea 的样式
       */
      inputContainerClassName?: string
      /**
       * 尺寸
       * @default 'md'
       */
      size?: Size
      value?: string
      /**
       * 输入内容变化时的回调
       */
      onChange?: (value: string, e: ChangeEvent<HTMLTextAreaElement>) => void
      /**
       * 聚焦时的回调
       */
      onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
      /**
       * 失焦时的回调
       */
      onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void
      /**
       * 按下键盘时的回调
       */
      onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
      /**
       * 按键释放时的回调
       */
      onKeyUp?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
      /**
       * 按下回车键时的回调
       */
      onPressEnter?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
      /**
       * 粘贴事件回调
       * 如果启用了 enableRichPaste，此回调会在富文本处理逻辑之后被调用。
       * 事件对象的 preventDefault 可能已经被调用。
       */
      onPaste?: (e: ReactClipboardEvent<HTMLTextAreaElement>) => void
      /**
       * 标签文本
       */
      label?: string
      /**
       * 标签位置
       * @default 'top'
       */
      labelPosition?: 'top' | 'left'
      /**
       * 是否启用富文本粘贴功能 (将粘贴的 HTML 转换为 Markdown)
       * @default false
       */
      enableRichPaste?: boolean
      /**
       * 计数器位置。'left'/'right' 控制 TextareaCounter 内部的 text-align
       * @default 'right'
       */
      counterPosition?: TextareaCounterProps['position']
      /**
       * 格式化计数器文本
       */
      counterFormat?: TextareaCounterProps['format']
    }
