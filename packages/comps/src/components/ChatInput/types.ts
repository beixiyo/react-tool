import type { ReactNode } from 'react'

/**
 * 提示词模板接口
 */
export interface PromptTemplate {
  /** 唯一标识符 */
  id: string
  /** 模板标题 */
  title: string
  /** 模板内容 */
  content: string
  /** 模板描述 */
  description?: string
  /** 模板分类 */
  category: PromptCategory
  /** 图标 */
  icon?: ReactNode
  /** 是否为用户自定义模板 */
  isCustom?: boolean
  /** 创建时间 */
  createdAt?: number
  /** 使用次数 */
  usageCount?: number
  /** 标签 */
  tags?: string[]
}

/**
 * 提示词分类
 */
export type PromptCategory
  = | 'code'
    | 'debug'
    | 'document'
    | 'explain'
    | 'optimize'
    | 'test'
    | 'translate'
    | 'custom'

/**
 * 提示词分类配置
 */
export interface PromptCategoryConfig {
  key: PromptCategory
  label: string
  icon: ReactNode
  color: string
  description?: string
}

/**
 * 输入历史记录
 */
export interface InputHistory {
  /** 唯一标识符 */
  id: string
  /** 输入内容 */
  content: string
  /** 创建时间 */
  timestamp: number
  /** 使用的模板ID（如果有） */
  templateId?: string
}

/**
 * 自动补全建议
 */
export interface AutoCompleteSuggestion {
  /** 建议文本 */
  text: string
  /** 建议类型 */
  type: 'template' | 'history' | 'keyword'
  /** 匹配的模板或历史记录 */
  source?: PromptTemplate | InputHistory
  /** 匹配度分数 */
  score?: number
}

/**
 * 语音录制的结果
 */
export interface VoiceRecordingResult {
  /**
   * 录制生成的音频链接
   */
  audioUrl: string
  /**
   * 录制生成的音频 Blob 数据
   */
  audioBlob: Blob
  /**
   * 录制过程中产生的原始数据块
   */
  chunks: Blob[]
}

/**
 * 提交数据载荷
 */
export interface ChatSubmitPayload {
  /**
   * 文本内容
   */
  text?: string
  /**
   * 使用的提示词模板
   */
  template?: PromptTemplate
  /**
   * 图片的 base64 列表
   */
  images?: string[]
  /**
   * 语音录制结果
   */
  voice?: VoiceRecordingResult
}

/**
 * ChatInput 组件属性
 */
export interface ChatInputProps {
  /** 输入值 */
  value?: string
  /** 占位符文本 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /**
   * 是否禁用文本输入（更精确的输入禁用控制）
   */
  disableInput?: boolean
  /**
   * 是否禁用语音相关功能与控件（更精确的语音禁用控制）
   */
  disableVoice?: boolean
  /** 是否显示加载状态 */
  loading?: boolean
  /** 是否启用快速提示词功能 */
  enablePromptTemplates?: boolean
  /** 是否启用输入历史记录 */
  enableHistory?: boolean
  /** 是否启用自动补全 */
  enableAutoComplete?: boolean
  /** 自定义提示词模板 */
  customTemplates?: PromptTemplate[]
  /** 历史记录最大数量 */
  maxHistoryCount?: number
  /** 是否显示上传区域 */
  showUploader?: boolean
  /** 是否显示快速模式开关 */
  showQuickMode?: boolean
  /** 快速模式状态 */
  quickMode?: boolean
  /** 自定义样式类名 */
  className?: string
  containerClassName?: string
  /** 自定义样式 */
  style?: React.CSSProperties

  /** 事件回调 */
  onChange?: (value: string) => void
  onSubmit?: (data: ChatSubmitPayload) => void
  onTemplateSelect?: (template: PromptTemplate) => void
  onHistorySelect?: (history: InputHistory) => void
  onQuickModeChange?: (enabled: boolean) => void
  onFocus?: () => void
  onBlur?: () => void

  /** 文件上传相关 */
  onFilesChange?: (files: string[]) => void
  onFileRemove?: (index: number) => void
  uploadedFiles?: string[]

  /**
   * 是否启用语音录制功能
   * @default false
   */
  enableVoiceRecorder?: boolean
  /**
   * 语音录制完成的回调
   */
  onVoiceRecordingFinish?: (recording: VoiceRecordingResult) => void
  /**
   * 语音录制流程错误回调
   */
  onVoiceRecorderError?: (error: Error) => void
}
