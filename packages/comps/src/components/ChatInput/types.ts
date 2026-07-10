import type { TargetAndTransition, Transition } from 'motion/react'
import type { ComponentType, ReactNode, Ref, RefObject } from 'react'
import type { VoiceRecorderPanelRenderContext } from '../LiveWaveAudio'

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
  /** 使用的模板 ID（如果有） */
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

export type ChatInputShortcut
  = | 'Enter'
    | 'Shift+Enter'
    | 'Mod+Enter'
    | 'Ctrl+Enter'
    | 'Meta+Enter'
    | 'Alt+Enter'
    | 'Mod+Shift+Enter'
    | 'Ctrl+Shift+Enter'
    | 'Meta+Shift+Enter'
    | 'Alt+Shift+Enter'
    | 'Mod+/'
    | 'Ctrl+/'
    | 'Meta+/'
    | 'Mod+H'
    | 'Ctrl+H'
    | 'Meta+H'

export type ChatInputShortcutList = ChatInputShortcut | readonly ChatInputShortcut[]

export type ChatInputShortcutAction = 'send' | 'wrap' | 'openPrompt' | 'openHistory'

export type ResolvedChatInputShortcuts = Record<ChatInputShortcutAction, ChatInputShortcut[]>

export interface ChatInputShortcuts {
  /**
   * 发送消息的快捷键
   *
   * @default 'Enter'
   */
  send?: ChatInputShortcutList

  /**
   * 插入换行的快捷键
   *
   * @default 'Shift+Enter'
   */
  wrap?: ChatInputShortcutList

  /**
   * 打开提示词模板面板的快捷键
   *
   * @default 'Mod+/'
   */
  openPrompt?: ChatInputShortcutList

  /**
   * 打开输入历史面板的快捷键
   *
   * @default 'Mod+H'
   */
  openHistory?: ChatInputShortcutList
}

export type ChatInputShortcutEvent = {
  key: string
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  altKey: boolean
}

export type MaybePromise<T> = T | Promise<T>

export interface ChatInputPromptTemplatesAdapter {
  /**
   * 加载提示词模板列表
   */
  load?: () => MaybePromise<PromptTemplate[]>

  /**
   * 持久化新增的自定义模板
   */
  save?: (template: PromptTemplate) => MaybePromise<void>

  /**
   * 更新模板
   */
  update?: (id: string, updates: Partial<PromptTemplate>) => MaybePromise<void>

  /**
   * 删除模板
   */
  remove?: (id: string) => MaybePromise<void>

  /**
   * 记录模板使用次数
   */
  touch?: (id: string) => MaybePromise<void>
}

export interface ChatInputHistoryAdapter {
  /**
   * 搜索或加载输入历史
   */
  search: (query: string) => MaybePromise<InputHistory[]>

  /**
   * 保存一条输入历史
   */
  save?: (content: string) => MaybePromise<InputHistory | void>

  /**
   * 删除一条输入历史
   */
  remove?: (id: string) => MaybePromise<void>

  /**
   * 清空输入历史
   */
  clear?: () => MaybePromise<void>
}

export interface ChatInputAutocompleteAdapter {
  /**
   * 根据当前输入获取补全项
   */
  search: (query: string, context: ChatInputAutocompleteContext) => MaybePromise<AutoCompleteSuggestion[]>
}

export interface ChatInputAutocompleteContext {
  templates: PromptTemplate[]
  histories: InputHistory[]
}

export interface ChatInputPromptTemplatesFeature {
  /**
   * 是否启用提示词模板
   *
   * @default false
   */
  enabled?: boolean

  /**
   * 外部受控模板列表
   */
  templates?: PromptTemplate[]

  /**
   * 是否混入内置默认模板
   *
   * @default true
   */
  includeDefaults?: boolean

  /**
   * 外部存储适配器
   */
  adapter?: ChatInputPromptTemplatesAdapter
}

export interface ChatInputHistoryFeature {
  /**
   * 是否启用输入历史
   *
   * @default false
   */
  enabled?: boolean

  /**
   * 外部受控历史列表
   */
  items?: InputHistory[]

  /**
   * 历史最大保留数量
   *
   * @default 50
   */
  maxCount?: number

  /**
   * 外部存储适配器
   */
  adapter?: ChatInputHistoryAdapter

  /**
   * 打开历史面板的快捷键
   *
   * @default 'Mod+H'
   */
  shortcut?: ChatInputShortcutList
}

export interface ChatInputAutocompleteFeature {
  /**
   * 是否启用自动补全
   *
   * @default false
   */
  enabled?: boolean

  /**
   * 外部补全适配器
   */
  adapter?: ChatInputAutocompleteAdapter
}

export interface ChatInputFeatures {
  /**
   * 提示词模板功能
   */
  promptTemplates?: boolean | ChatInputPromptTemplatesFeature

  /**
   * 输入历史功能
   */
  history?: boolean | ChatInputHistoryFeature

  /**
   * 自动补全功能
   */
  autocomplete?: boolean | ChatInputAutocompleteFeature
}

export interface ResolvedChatInputFeatures {
  promptTemplates: Required<Pick<ChatInputPromptTemplatesFeature, 'enabled' | 'includeDefaults'>> & Omit<ChatInputPromptTemplatesFeature, 'enabled' | 'includeDefaults'>
  history: Required<Pick<ChatInputHistoryFeature, 'enabled' | 'maxCount'>> & Omit<ChatInputHistoryFeature, 'enabled' | 'maxCount'>
  autocomplete: Required<Pick<ChatInputAutocompleteFeature, 'enabled'>> & Omit<ChatInputAutocompleteFeature, 'enabled'>
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
  /**
   * 允许在输入框文本为空时仍可发送
   *
   * 默认 false（文本为空则发送按钮禁用、且内部提交守卫拦截）
   * 当消费方在输入框之外维护可发送内容（如外部图片附件）时置 true，
   * 即可在仅图无文场景放开发送；整条输入栏的 `disabled` 仍始终优先
   */
  allowEmptySubmit?: boolean
  /**
   * 快捷键动作映射
   *
   * @default { send: 'Enter', wrap: 'Shift+Enter' }
   */
  shortcuts?: ChatInputShortcuts
  /**
   * 可选能力配置。提示词、历史、补全默认关闭，适合由业务侧接管存储与搜索
   */
  features?: ChatInputFeatures
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
  /**
   * 输入区顶部插槽，用于放置与输入框同属一个面板的上下文内容
   *
   * @default undefined
   */
  topContent?: ReactNode
  /**
   * 自定义底部操作栏的编排
   *
   * 不传时使用组件默认布局；传入时由你决定按钮的顺序与分组
   * `ctx` 里的零件都是**引用稳定的组件**，统一用 `<X />` 摆放，可传 `className`
   * 等属性覆盖样式；自定义动作（如截图）用 `ctx.IconButton`
   *
   * @example
   * renderActions={({ UploaderButton, VoiceControl, SendButton, IconButton }) => (
   *   <>
   *     <div className="flex items-center gap-2">
   *       <UploaderButton icon={<Image size={18} />} />
   *       <IconButton label="截图" onClick={onShot}><Scan size={18} /></IconButton>
   *     </div>
   *     <div className="flex items-center gap-2"><VoiceControl /><SendButton /></div>
   *   </>
   * )}
   */
  renderActions?: (ctx: BottomBarRenderContext) => ReactNode
  /**
   * 自定义渲染语音录制面板（传入则完全接管面板渲染，据 ctx 自绘）
   *
   * 用于复用宿主自有的语音识别 UI（如端外长按 fn 的「Recognizing + 波形 + Stop」样式），
   * 不传则使用内置 {@link VoiceRecorderPanel} 默认面板
   */
  renderVoicePanel?: (ctx: VoiceRecorderPanelRenderContext) => ReactNode
  /**
   * 自定义渲染底部语音触发按钮
   *
   * 只接管按钮本身，不改变录音状态机与语音面板
   * 返回 `null` 可显式隐藏按钮；返回 `undefined` 时使用默认按钮
   */
  renderVoiceControl?: (ctx: VoiceControlRenderContext) => ReactNode
  /**
   * 是否根据内容换行自动调整输入框高度
   * - 启用时输入框从 `minRows` 行起步，随内容增高，超过 `maxRows` 行后内部出现滚动条
   * - 关闭时维持固定高度（可通过 `className` 传入高度类覆盖）
   * @default true
   */
  autoResize?: boolean
  /**
   * 自动高度时的最小行数，仅在 `autoResize` 为 true 时生效
   * @default 1
   */
  minRows?: number
  /**
   * 自动高度时的最大行数，超出后输入框内部出现滚动条，仅在 `autoResize` 为 true 时生效
   * @default 6
   */
  maxRows?: number
  /** 自定义样式类名 */
  className?: string
  containerClassName?: string
  /**
   * 根容器 Motion 配置
   *
   * 传入对象时会与默认值浅合并，可只覆盖需要调整的字段。
   * @default undefined
   */
  motionConfig?: ChatInputMotionConfig
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
   * 接受的文件类型，透传给内部 Uploader
   * @default 'image/*'
   */
  accept?: string
  /** 最大上传图片数量，超出弹出提示 */
  maxCount?: number
  /** 单张图片最大体积（字节），超出弹出提示 */
  maxSize?: number
  /** 图片最大像素（宽高），超出弹出提示 */
  maxPixels?: { width: number, height: number }

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

/**
 * `ctx.IconButton` 的属性：统一风格的图标按钮外壳
 * 用于在 `renderActions` 中接入自定义动作（如截图），免去手抄样式类
 */
export interface BottomBarIconButtonProps {
  /** 悬浮提示文案，传了才包裹 Tooltip */
  label?: string
  /** 是否处于激活态（高亮） */
  active?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 点击回调 */
  onClick?: () => void
  /** 追加样式类 */
  className?: string
  /** 图标内容 */
  children: ReactNode
}

export type ChatInputAreaProps = {
  value: string
  textareaRef: Ref<HTMLTextAreaElement>
  disabled?: boolean
  placeholder?: string
  /** 是否根据内容自动调整高度 */
  autoResize?: boolean
  /** 自动高度时的最小行数 */
  minRows?: number
  /** 自动高度时的最大行数，超出后内部滚动 */
  maxRows?: number
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  onPressEnter: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

export type VoiceControlStatus = 'idle' | 'recording' | 'processing' | 'review'

export type VoiceControlButtonProps = {
  status: VoiceControlStatus
  disabled?: boolean
  onClick: () => void
  voiceMode: VoiceMode
  onVoiceModeChange: (mode: VoiceMode) => void
  /**
   * 可用的语音模式选项
   * 如果不提供，默认显示所有选项 ['audio', 'text']
   * @default ['audio', 'text']
   */
  availableModes?: VoiceMode[]
}

export type VoiceControlRenderContext = {
  /** 当前语音按钮状态 */
  status: VoiceControlStatus
  /** 是否禁用 */
  disabled: boolean
  /** 语音面板是否正在显示 */
  panelVisible: boolean
  /** 点击语音按钮的内置行为 */
  onClick: () => void
  /** 当前语音模式 */
  voiceMode: VoiceMode
  /** 切换语音模式 */
  onVoiceModeChange: (mode: VoiceMode) => void
  /** 可用的语音模式选项 */
  availableModes?: VoiceMode[]
  /** 默认语音按钮，可在局部包裹或直接复用 */
  DefaultVoiceControl: ComponentType<VoiceControlButtonProps>
}

export interface AutoCompletePanelProps {
  /** 是否显示 */
  visible: boolean
  /** 建议列表 */
  suggestions: AutoCompleteSuggestion[]
  /** 选中的索引 */
  selectedIndex: number
  /** 是否加载中 */
  loading?: boolean
  /** 自定义样式类名 */
  className?: string
  /** 关联的输入元素，用于获取光标位置 */
  inputElement?: HTMLInputElement | HTMLTextAreaElement | null
  /** 是否启用光标跟随定位 */
  followCursor?: boolean

  /** 事件回调 */
  onSuggestionSelect: (suggestion: AutoCompleteSuggestion) => void
  onClose: () => void
  onSelectionChange?: (index: number) => void
}

export interface HistoryPanelProps {
  /** 是否显示 */
  visible: boolean
  /** 搜索关键词 */
  searchQuery: string
  /** 高亮的索引 */
  highlightedIndex: number
  /** 历史记录列表 */
  histories: InputHistory[]
  /** 自定义样式类名 */
  className?: string

  /** 事件回调 */
  onHistorySelect: (history: InputHistory) => void
  onHistoryDelete: (id: string) => void
  onClearAll: () => void
  onClose: () => void
  onHighlightChange: (index: number) => void
}

export interface PromptPanelProps {
  /** 是否显示 */
  visible: boolean
  /** 搜索关键词 */
  searchQuery: string
  /** 选中的分类 */
  selectedCategory?: PromptCategory
  /** 高亮的索引 */
  highlightedIndex: number
  /** 提示词模板列表 */
  templates: PromptTemplate[]
  /** 分类配置 */
  categories: PromptCategoryConfig[]
  /** 自定义样式类名 */
  className?: string

  /** 事件回调 */
  onTemplateSelect: (template: PromptTemplate) => void
  onCategorySelect: (category: PromptCategory) => void
  onClose: () => void
  onHighlightChange: (index: number) => void
}

export type BottomBarProps = {
  enablePromptTemplates?: boolean
  enableHistory?: boolean
  enableUploader?: boolean
  enableHelper?: boolean
  loading?: boolean
  disabled?: boolean
  actualValue: string
  /** 允许文本为空时仍可发送（消费方有外部可发送内容，如图片附件） */
  allowEmptySubmit?: boolean
  shortcuts: ResolvedChatInputShortcuts
  showPromptPanel?: boolean
  showHistoryPanel?: boolean
  textareaRef: RefObject<HTMLTextAreaElement | null>
  chatInputAreaRef: RefObject<HTMLDivElement | null>
  onFilesChange: (files: { base64: string }[]) => void
  onFileRemove?: (index: number) => void
  onSubmit: () => void
  onShowPromptPanelToggle: () => void
  onShowHistoryPanelToggle: () => void
  /** 触发文件选择（上传由上层单实例 Uploader 接管，此处仅触发） */
  onUploaderClick: () => void
  voiceControl?: ReactNode
  /** 自定义底部操作栏编排；不传则用默认布局 */
  renderActions?: (ctx: BottomBarRenderContext) => ReactNode
}

/** 底部栏零件组件的公共属性 */
export interface BottomBarPartProps {
  /** 追加 / 覆盖样式类 */
  className?: string
}

/** 发送按钮属性 */
export interface BottomBarSendButtonProps extends BottomBarPartProps {
  /** 自定义图标，默认上箭头 */
  icon?: ReactNode
}

/** 上传按钮属性 */
export interface BottomBarUploaderButtonProps extends BottomBarPartProps {
  /** 自定义图标，默认回形针 */
  icon?: ReactNode
  /** 接受的文件类型，默认 image/ */
  accept?: string
}

/**
 * `renderActions` 的渲染上下文
 *
 * 组件负责「零件」（已接好行为与样式），消费方负责「编排」（顺序与分组）
 * 所有零件都是**引用稳定的组件**，统一用 `<X />` 摆放，可传 `className` 等属性覆盖样式；
 * 需要更底层控制时再用 `refs` / `state` / `actions`
 */
export interface BottomBarRenderContext {
  /** 语音控件（未启用语音录制时渲染 null） */
  VoiceControl: ComponentType<BottomBarPartProps>
  /** 发送按钮 */
  SendButton: ComponentType<BottomBarSendButtonProps>
  /** 上传按钮，已接入内部粘贴 / 拖拽，可自定义图标与 accept */
  UploaderButton: ComponentType<BottomBarUploaderButtonProps>
  /** 提示词模板按钮 */
  PromptButton: ComponentType<BottomBarPartProps>
  /** 输入历史按钮 */
  HistoryButton: ComponentType<BottomBarPartProps>
  /** 快捷键帮助按钮 */
  HelperButton: ComponentType<BottomBarPartProps>
  /** 统一风格的图标按钮外壳，便于接入自定义动作（如截图） */
  IconButton: ComponentType<BottomBarIconButtonProps>
  /** 组件默认的底部栏内容（按 enable* 开关渲染），便于在其基础上微调 */
  DefaultActions: ComponentType
  /** 内部 ref，自定义按钮可借此接入输入框 / 拖拽区 */
  refs: {
    textareaRef: RefObject<HTMLTextAreaElement | null>
    chatInputAreaRef: RefObject<HTMLDivElement | null>
  }
  /** 当前输入状态 */
  state: {
    actualValue: string
    loading: boolean
    disabled: boolean
    showPromptPanel: boolean
    showHistoryPanel: boolean
  }
  /** 常用动作 */
  actions: {
    /** 发送当前内容 */
    submit: () => void
    /** 切换提示词面板 */
    togglePrompt: () => void
    /** 切换历史面板 */
    toggleHistory: () => void
    /** 上传文件变更（base64 列表） */
    onFilesChange: (files: { base64: string }[]) => void
    /** 移除已上传文件 */
    onFileRemove?: (index: number) => void
  }
}

/**
 * ChatInput 根容器 Motion 配置
 */
export interface ChatInputMotionConfig {
  /**
   * 初始状态
   *
   * @default { opacity: 0, y: 20 }
   */
  initial?: TargetAndTransition
  /**
   * 进入后的状态
   *
   * @default { opacity: 1, y: 0 }
   */
  animate?: TargetAndTransition
  /**
   * 退出状态
   *
   * @default { opacity: 0, y: -20 }
   */
  exit?: TargetAndTransition
  /**
   * 动画过渡配置
   *
   * @default { duration: 0.3 }
   */
  transition?: Transition
}

export type BottomBarLatestState = {
  t: (key: string, options?: Record<string, unknown>) => string
  enablePromptTemplates?: boolean
  enableHistory?: boolean
  enableUploader?: boolean
  enableHelper?: boolean
  loading?: boolean
  disabled?: boolean
  actualValue: string
  allowEmptySubmit?: boolean
  shortcuts: ResolvedChatInputShortcuts
  showPromptPanel?: boolean
  showHistoryPanel?: boolean
  voiceControl?: ReactNode
  textareaRef: RefObject<HTMLTextAreaElement | null>
  chatInputAreaRef: RefObject<HTMLDivElement | null>
  onFilesChange: (files: { base64: string }[]) => void
  onFileRemove?: (index: number) => void
  onSubmit: () => void
  onShowPromptPanelToggle: () => void
  onShowHistoryPanelToggle: () => void
  onUploaderClick: () => void
}

export type SearchIndexItem = {
  id: string
  type: 'template' | 'history'
  searchText: string
  source: PromptTemplate | InputHistory
}

export type InteractionHandlerOptions = {
  /** 外部属性 */
  loading: ChatInputProps['loading']
  disabled: ChatInputProps['disabled']
  allowEmptySubmit: ChatInputProps['allowEmptySubmit']
  enableHistory: ChatInputProps['enableHistory']
  enableAutoComplete: ChatInputProps['enableAutoComplete']
  onSubmit: ChatInputProps['onSubmit']
  onTemplateSelect: ChatInputProps['onTemplateSelect']
  onHistorySelect: ChatInputProps['onHistorySelect']

  /** 值管理器 */
  actualValue: string
  handleChangeVal: (val: string) => void

  /** 面板管理器 */
  setShowPromptPanel: (show: boolean) => void
  setShowHistoryPanel: (show: boolean) => void
  setShowAutoComplete: (show: boolean) => void
  closeAllPanels: () => void

  /** 状态 */
  setSearchQuery: (query: string) => void

  /** 引用 */
  textareaRef: RefObject<HTMLTextAreaElement | null>

  /** 自定义 hooks */
  promptTemplatesHook: {
    incrementUsage: (id: string) => void
  }
  inputHistoryHook: {
    addHistory: (content: string, templateId?: string) => void
    resetHistoryNavigation: () => void
  }
  autoCompleteHook: {
    generateSuggestions: (query: string) => void | Promise<void>
    clearSuggestions: () => void
  }
}

export type UseChatInputEnterKeyOptions = {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  value: string
  shortcuts: ResolvedChatInputShortcuts
  autoCompleteVisible: boolean
  selectedSuggestion: AutoCompleteSuggestion | null
  onChange: (value: string) => void
  onSubmit: () => void
  onAutoCompleteSelect: (suggestion: AutoCompleteSuggestion) => void
}

export type UseAutoCompleteOptions = {
  templates: PromptTemplate[]
  histories: InputHistory[]
  enabled?: boolean
  adapter?: ChatInputAutocompleteAdapter
}

export type UseInputHistoryOptions = {
  enabled?: boolean
  maxCount?: number
  items?: InputHistory[]
  adapter?: ChatInputHistoryAdapter
}

export type UsePromptTemplatesOptions = {
  enabled?: boolean
  templates?: PromptTemplate[]
  includeDefaults?: boolean
  adapter?: ChatInputPromptTemplatesAdapter
}

export type UseVoiceRecorderOptions = {
  /**
   * 是否启用语音录制功能
   * @default false
   */
  enableVoiceRecorder?: boolean
  /**
   * 语音录制完成回调
   */
  onVoiceRecordingFinish?: (recording: VoiceRecordingResult) => void
  /**
   * 语音录制错误回调
   */
  onVoiceRecorderError?: (error: Error) => void
  /**
   * 语音转文字结果回调
   */
  onTranscriptResult?: (text: string) => void
  /**
   * 音频数据变化回调
   * 当音频数据发生变化时（录制完成、清除等）会调用此回调通知调用者
   */
  onAudioDataChange?: (audioData: VoiceRecordingResult | null) => void
  /**
   * 可用的语音模式选项
   * 如果不提供，默认显示所有选项 ['audio', 'text']
   * 组件内部会自动使用第一个可用选项作为初始模式
   */
  voiceModes?: VoiceMode[]
  /**
   * 语音模式切换回调
   */
  onVoiceModeChange?: (mode: VoiceMode) => void
  /**
   * ASR 配置选项
   * - 如果提供 callbacks，使用回调模式
   * - 如果不提供，使用默认的 SpeakToTxt（使用 defaultConfig）
   */
  asrConfig?: ASRConfig
  /**
   * 当前输入框的值（用于 TextInsertController）
   */
  actualValue?: string
  /**
   * 更新输入框值的函数（用于 TextInsertController）
   */
  handleChangeVal?: (value: string) => void
  /**
   * 录音前的文本引用（用于 TextInsertController）
   */
  textBeforeRecordRef?: RefObject<string>
}

export type UseShortcutActionsOptions = {
  shortcuts: ResolvedChatInputShortcuts
  promptEnabled: boolean
  historyEnabled: boolean
  openPrompt: () => void
  openHistory: () => void
}

export type ResolveChatInputFeaturesOptions = {
  features?: ChatInputFeatures
  enablePromptTemplates?: boolean
  enableHistory?: boolean
  enableAutoComplete?: boolean
  customTemplates?: PromptTemplate[]
  maxHistoryCount?: number
}
