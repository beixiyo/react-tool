import type { FC, ReactNode, RefObject } from 'react'
import type {
  BottomBarIconButtonProps,
  BottomBarPartProps,
  BottomBarRenderContext,
  BottomBarSendButtonProps,
  BottomBarUploaderButtonProps,
} from '../types'
import { ArrowUp, Command, HelpCircle, History, Paperclip, Sparkles } from 'lucide-react'
import { memo, useRef } from 'react'
import { cn } from 'utils'
import { Button, Tooltip } from '../..'
import { useT } from '../../../i18n'
import { formatShortcut } from '../constants'

/** 图标按钮统一样式 */
const ICON_BTN_CLS = 'p-2 rounded-xl transition-all duration-200 text-text2 hover:text-text hover:bg-background3 hover:scale-105'

export type BottomBarProps = {
  enablePromptTemplates?: boolean
  enableHistory?: boolean
  enableUploader?: boolean
  enableHelper?: boolean
  loading?: boolean
  disabled?: boolean
  actualValue: string
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

/** 零件读取的「最新值」，每次渲染刷新到 ref，保证零件组件身份稳定又能拿到新值 */
type LatestState = {
  t: ReturnType<typeof useT>
  enablePromptTemplates?: boolean
  enableHistory?: boolean
  enableUploader?: boolean
  enableHelper?: boolean
  loading?: boolean
  disabled?: boolean
  actualValue: string
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

/**
 * 统一风格的图标按钮外壳（模块级定义，引用稳定）
 * 暴露给 renderActions，用于接入自定义动作（如截图）
 */
const BottomBarIconButton = memo<BottomBarIconButtonProps>(({
  label,
  active,
  disabled,
  onClick,
  className,
  children,
}) => {
  const button = (
    <button
      type="button"
      disabled={ disabled }
      onClick={ onClick }
      className={ cn(
        ICON_BTN_CLS,
        active && 'text-text bg-background3 scale-105',
        disabled && 'opacity-50 pointer-events-none',
        className,
      ) }
    >
      { children }
    </button>
  )

  return label
    ? <Tooltip content={ label }>{ button }</Tooltip>
    : button
})
BottomBarIconButton.displayName = 'BottomBarIconButton'

/**
 * 一次性创建底部栏零件组件（身份稳定，不随渲染变化）
 * 组件内部通过 `latest.current` 读取最新值，所以行为始终是最新的，又不会触发 remount
 */
function createParts(latest: RefObject<LatestState>) {
  const VoiceControl: FC<BottomBarPartProps> = ({ className }) => {
    const { voiceControl } = latest.current
    if (!voiceControl)
      return null
    return className
      ? <span className={ className }>{ voiceControl }</span>
      : <>{ voiceControl }</>
  }
  VoiceControl.displayName = 'BottomBar.VoiceControl'

  const SendButton: FC<BottomBarSendButtonProps> = ({ className, icon }) => {
    const { loading, disabled, actualValue, onSubmit } = latest.current
    return (
      <Button
        loading={ loading }
        disabled={ disabled || !actualValue.trim() }
        variant="primary"
        size="sm"
        className={ cn('shrink-0', className) }
        rightIcon={ icon ?? <ArrowUp size={ 17 } /> }
        rounded="full"
        onClick={ onSubmit }
      >
      </Button>
    )
  }
  SendButton.displayName = 'BottomBar.SendButton'

  const UploaderButton: FC<BottomBarUploaderButtonProps> = ({ className, icon }) => {
    const { t, onUploaderClick } = latest.current
    return (
      <Tooltip content={ t('chatInput.buttons.uploadFile') }>
        <button
          type="button"
          onClick={ onUploaderClick }
          className={ cn(ICON_BTN_CLS, className) }
        >
          { icon ?? <Paperclip size={ 18 } /> }
        </button>
      </Tooltip>
    )
  }
  UploaderButton.displayName = 'BottomBar.UploaderButton'

  const PromptButton: FC<BottomBarPartProps> = ({ className }) => {
    const { t, showPromptPanel, onShowPromptPanelToggle } = latest.current
    return (
      <Tooltip content={ <div className="flex items-center gap-2">
        <Command size={ 12 } />
        <div className="rounded-sm bg-background2/20 px-1 py-0.5 text-xs">{ formatShortcut('/') }</div>
        { t('chatInput.buttons.promptTemplates') }
      </div> }>
        <button
          onClick={ onShowPromptPanelToggle }
          className={ cn(ICON_BTN_CLS, showPromptPanel && 'text-info bg-infoBg/30 scale-105', className) }
        >
          <Sparkles size={ 18 } />
        </button>
      </Tooltip>
    )
  }
  PromptButton.displayName = 'BottomBar.PromptButton'

  const HistoryButton: FC<BottomBarPartProps> = ({ className }) => {
    const { t, showHistoryPanel, onShowHistoryPanelToggle } = latest.current
    return (
      <Tooltip content={ <div className="flex items-center gap-2">
        <Command size={ 12 } />
        <div className="rounded-sm bg-background2/20 px-1 py-0.5 text-xs">{ formatShortcut('H') }</div>
        { t('chatInput.buttons.inputHistory') }
      </div> }>
        <button
          onClick={ onShowHistoryPanelToggle }
          className={ cn(ICON_BTN_CLS, showHistoryPanel && 'text-success bg-successBg/30 scale-105', className) }
        >
          <History size={ 18 } />
        </button>
      </Tooltip>
    )
  }
  HistoryButton.displayName = 'BottomBar.HistoryButton'

  const HelperButton: FC<BottomBarPartProps> = ({ className }) => {
    const { t } = latest.current
    return (
      <Tooltip
        content={
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="rounded-sm bg-background2/20 px-1 py-0.5 text-xs">{ formatShortcut('/') }</div>
              <Sparkles size={ 12 } />
              { t('chatInput.shortcuts.templates') }
            </span>
            <span className="flex items-center gap-1">
              <div className="rounded-sm bg-background2/20 px-1 py-0.5 text-xs">{ formatShortcut('H') }</div>
              <History size={ 12 } />
              { t('chatInput.shortcuts.history') }
            </span>
            <span className="flex items-center gap-1">
              <div className="rounded-sm bg-background2/20 px-1 py-0.5 text-xs">{ formatShortcut('Enter') }</div>
              <ArrowUp size={ 12 } />
              { t('chatInput.shortcuts.send') }
            </span>
          </div>
        }
      >
        <button
          style={ { translate: '0px 3px' } }
          className={ cn('rounded-xl transition-all duration-200 cursor-help text-text2 hover:text-text hover:scale-105', className) }
        >
          <HelpCircle size={ 22 } strokeWidth={ 1.5 } />
        </button>
      </Tooltip>
    )
  }
  HelperButton.displayName = 'BottomBar.HelperButton'

  /** 默认布局：左 语音 + 帮助 / 右 提示词 + 历史 + 上传 + 发送（按 enable* 开关渲染） */
  const DefaultActions: FC = () => {
    const { enablePromptTemplates, enableHistory, enableUploader, enableHelper } = latest.current
    return (
      <>
        <div className="flex items-center gap-4">
          <VoiceControl />
          { enableHelper && <HelperButton /> }
        </div>

        <div className="flex items-center gap-2">
          { enablePromptTemplates && <PromptButton /> }
          { enableHistory && <HistoryButton /> }
          { enableUploader && <UploaderButton /> }
          <SendButton />
        </div>
      </>
    )
  }
  DefaultActions.displayName = 'BottomBar.DefaultActions'

  return { VoiceControl, SendButton, UploaderButton, PromptButton, HistoryButton, HelperButton, DefaultActions }
}

export const BottomBar = memo<BottomBarProps>((props) => {
  const {
    textareaRef,
    chatInputAreaRef,
    onFilesChange,
    onFileRemove,
    onSubmit,
    onShowPromptPanelToggle,
    onShowHistoryPanelToggle,
    onUploaderClick,
    showPromptPanel,
    showHistoryPanel,
    actualValue,
    loading,
    disabled,
    renderActions,
  } = props

  const t = useT()

  /** 每次渲染把最新值刷进 ref，供身份稳定的零件组件读取 */
  const latest = useRef<LatestState>({} as LatestState)
  latest.current = {
    t,
    enablePromptTemplates: props.enablePromptTemplates,
    enableHistory: props.enableHistory,
    enableUploader: props.enableUploader,
    enableHelper: props.enableHelper,
    loading,
    disabled,
    actualValue,
    showPromptPanel,
    showHistoryPanel,
    voiceControl: props.voiceControl,
    textareaRef,
    chatInputAreaRef,
    onFilesChange,
    onFileRemove,
    onSubmit,
    onShowPromptPanelToggle,
    onShowHistoryPanelToggle,
    onUploaderClick,
  }

  /** 零件组件只创建一次，引用稳定 → 用 <X /> 摆放也不会 remount */
  const partsRef = useRef<ReturnType<typeof createParts> | null>(null)
  if (!partsRef.current)
    partsRef.current = createParts(latest)
  const parts = partsRef.current

  const ctx: BottomBarRenderContext = {
    ...parts,
    IconButton: BottomBarIconButton,
    refs: { textareaRef, chatInputAreaRef },
    state: {
      actualValue,
      loading: !!loading,
      disabled: !!disabled,
      showPromptPanel: !!showPromptPanel,
      showHistoryPanel: !!showHistoryPanel,
    },
    actions: {
      submit: onSubmit,
      togglePrompt: onShowPromptPanelToggle,
      toggleHistory: onShowHistoryPanelToggle,
      onFilesChange,
      onFileRemove,
    },
  }

  const { DefaultActions } = parts

  return (
    <div className="flex h-10 w-full shrink-0 items-center justify-between gap-2 px-3 pb-2">
      { renderActions
        ? renderActions(ctx)
        : <DefaultActions /> }
    </div>
  )
})

BottomBar.displayName = 'BottomBar'
