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
 * 文本插入控制器
 * 提供给外部回调使用，用于控制文本插入行为
 */
export interface TextInsertController {
  /**
   * 当前输入框的完整文本
   */
  readonly currentText: string

  /**
   * 开始录音前的文本（用于追加模式）
   */
  readonly textBeforeRecord: string

  /**
   * 插入文本到当前光标位置
   * @param text 要插入的文本
   * @param replaceMode 是否替换模式（默认 false，追加模式）
   */
  insertText: (text: string, replaceMode?: boolean) => void

  /**
   * 替换整个输入框内容
   * @param text 新文本
   */
  replaceText: (text: string) => void

  /**
   * 追加文本到末尾
   * @param text 要追加的文本
   */
  appendText: (text: string) => void
}

/**
 * 自定义 ASR 回调配置
 */
export interface CustomASRCallbacks {
  /**
   * 开始录音回调
   * @param controller 文本插入控制器，可用于获取当前文本状态
   */
  onStartRecord?: (controller: TextInsertController) => void | Promise<void>

  /**
   * 录音结束回调
   * @param audioData 录音数据
   * @param controller 文本插入控制器，可用于插入识别结果
   */
  onEndRecord?: (
    audioData: VoiceRecordingResult,
    controller: TextInsertController,
  ) => void | Promise<void>

  /**
   * 识别结果更新回调（实时流式返回）
   * @param text 识别到的文本
   * @param controller 文本插入控制器
   */
  onTranscriptUpdate?: (
    text: string,
    controller: TextInsertController,
  ) => void

  /**
   * 错误回调
   */
  onError?: (error: Error) => void
}

/**
 * ASR 配置选项
 */
export interface ASRConfig {
  /**
   * 自定义 ASR 回调
   * 如果提供，将使用回调方式处理 ASR，内部会自动管理文本插入
   * 如果不提供，使用默认的 SpeakToTxt
   */
  callbacks?: CustomASRCallbacks

  /**
   * 默认 SpeakToTxt 的配置项（仅在未提供 callbacks 时生效）
   */
  defaultConfig?: {
    /** 语言代码，如 'zh-CN', 'en-US' */
    lang?: string
    /** 是否连续识别 */
    continuous?: boolean
    /** 是否返回中间结果 */
    interimResults?: boolean
    /** 其他 SpeakToTxt 支持的配置项 */
    [key: string]: any
  }
}

/**
 * 语音模式类型
 */
export type VoiceMode = 'audio' | 'text'

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
  /** 是否启用快捷键提示 */
  enableHelper?: boolean
  /** 是否启用自动补全 */
  enableAutoComplete?: boolean
  /** 自定义提示词模板 */
  customTemplates?: PromptTemplate[]
  /** 历史记录最大数量 */
  maxHistoryCount?: number
  /** 是否显示上传区域 */
  enableUploader?: boolean
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
   * 语音模式切换回调
   */
  onVoiceModeChange?: (mode: VoiceMode) => void
  /**
   * 可用的语音模式选项
   * 如果不提供，默认显示所有选项 ['audio', 'text']
   * 组件内部会自动使用第一个可用选项作为初始模式
   * @default ['audio', 'text']
   */
  voiceModes?: VoiceMode[]
  /**
   * 语音录制完成的回调
   */
  onVoiceRecordingFinish?: (recording: VoiceRecordingResult) => void
  /**
   * 语音录制流程错误回调
   */
  onVoiceRecorderError?: (error: Error) => void
  /**
   * 音频数据变化回调
   * 当音频数据发生变化时（录制完成、清除等）会调用此回调通知调用者
   * @param audioData 当前的音频数据，如果为 null 表示已清除
   */
  onAudioDataChange?: (audioData: VoiceRecordingResult | null) => void
  /**
   * ASR 配置选项
   * - 如果提供 callbacks，使用自定义 ASR 回调
   * - 如果不提供，使用默认的 SpeakToTxt（使用 asrConfig.defaultConfig）
   */
  asrConfig?: ASRConfig

  /**
   * 语音提交回调
   * 当用户在 VoiceRecorderPanel 中点击提交按钮时调用
   * 不同于 onSubmit（输入框发送按钮），这个专门处理语音数据的提交
   */
  onVoiceSubmit?: (voice: VoiceRecordingResult) => void
}
