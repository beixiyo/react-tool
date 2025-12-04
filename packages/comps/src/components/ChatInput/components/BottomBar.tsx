import type { ReactNode, RefObject } from 'react'
import { ArrowUpFromDot, Command, HelpCircle, History, Paperclip, Sparkles } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Button, Switch, Tooltip, Uploader } from '../..'
import { useT } from '../../../i18n'

export type BottomBarProps = {
  bottomBarHeight: number
  enablePromptTemplates?: boolean
  enableHistory?: boolean
  showQuickMode?: boolean
  showUploader?: boolean
  quickMode?: boolean
  loading?: boolean
  disabled?: boolean
  actualValue: string
  showPromptPanel?: boolean
  showHistoryPanel?: boolean
  textareaRef: RefObject<HTMLTextAreaElement | null>
  chatInputAreaRef: RefObject<HTMLDivElement | null>
  onQuickModeChange?: (checked: boolean) => void
  onFilesChange: (files: { base64: string }[]) => void
  onFileRemove?: (index: number) => void
  onSubmit: () => void
  onShowPromptPanelToggle: () => void
  onShowHistoryPanelToggle: () => void
  voiceControl?: ReactNode
}

export const BottomBar = memo<BottomBarProps>((
  {
    bottomBarHeight,
    enablePromptTemplates,
    enableHistory,
    showQuickMode,
    showUploader,
    quickMode,
    loading,
    disabled,
    actualValue,
    showPromptPanel,
    showHistoryPanel,
    textareaRef,
    chatInputAreaRef,
    onQuickModeChange,
    onFilesChange,
    onFileRemove,
    onSubmit,
    onShowPromptPanelToggle,
    onShowHistoryPanelToggle,
    voiceControl,
  },
) => {
  const t = useT()

  return (
    <div
      className="w-full flex items-center gap-4 px-3 pb-2"
      style={ {
        height: bottomBarHeight,
      } }
    >
      {/* 快捷键提示 - 悬浮显示 */ }
      <Tooltip
        content={
          <div className="flex items-center gap-4 p-2">
            <span className="flex items-center gap-1">
              <div className="rounded bg-gray-700 px-1 py-0.5 text-xs">Ctrl + /</div>
              <Sparkles size={ 12 } />
              { t('chatInput.shortcuts.templates') }
            </span>
            <span className="flex items-center gap-1">
              <div className="rounded bg-gray-700 px-1 py-0.5 text-xs">Ctrl + H</div>
              <History size={ 12 } />
              { t('chatInput.shortcuts.history') }
            </span>
            <span className="flex items-center gap-1">
              <div className="rounded bg-gray-700 px-1 py-0.5 text-xs">Ctrl + Enter</div>
              <ArrowUpFromDot size={ 12 } />
              { t('chatInput.shortcuts.send') }
            </span>
          </div>
        }
      >
        <button
          className={ cn(
            'rounded-xl transition-all duration-200 cursor-help',
            'text-textSecondary hover:text-textPrimary',
            'dark:text-textSecondary dark:hover:text-textPrimary hover:scale-105',
          ) }
        >
          <HelpCircle size={ 22 } strokeWidth={ 1.5 } />
        </button>
      </Tooltip>

      {/* 功能按钮 */ }
      <div className="ml-auto flex items-center gap-2">
        { enablePromptTemplates && (
          <Tooltip content={ <div className="flex items-center gap-2">
            <Command size={ 12 } />
            <div className="rounded bg-gray-700 px-1 py-0.5 text-xs">Ctrl + /</div>
            { t('chatInput.buttons.promptTemplates') }
          </div> }>
            <button
              onClick={ onShowPromptPanelToggle }
              className={ cn(
                'p-2 rounded-xl transition-all duration-200',
                'text-textSecondary hover:text-textPrimary',
                'dark:text-textSecondary dark:hover:text-textPrimary',
                'hover:bg-backgroundSubtle dark:hover:bg-backgroundSubtle hover:scale-105',
                showPromptPanel && 'text-info bg-infoBg/30 dark:bg-infoBg/30 scale-105',
              ) }
            >
              <Sparkles size={ 18 } />
            </button>
          </Tooltip>
        ) }

        { enableHistory && (
          <Tooltip content={ <div className="flex items-center gap-2">
            <Command size={ 12 } />
            <div className="rounded bg-gray-700 px-1 py-0.5 text-xs">Ctrl + H</div>
            { t('chatInput.buttons.inputHistory') }
          </div> }>
            <button
              onClick={ onShowHistoryPanelToggle }
              className={ cn(
                'p-2 rounded-xl transition-all duration-200',
                'text-textSecondary hover:text-textPrimary',
                'dark:text-textSecondary dark:hover:text-textPrimary',
                'hover:bg-backgroundSubtle dark:hover:bg-backgroundSubtle hover:scale-105',
                showHistoryPanel && 'text-success bg-successBg/30 dark:bg-successBg/30 scale-105',
              ) }
            >
              <History size={ 18 } />
            </button>
          </Tooltip>
        ) }

        {/* 快速模式开关 */ }
        { showQuickMode && (
          <label className="flex items-center gap-2">
            <Switch
              size="sm"
              checked={ quickMode }
              onChange={ onQuickModeChange }
            />
            <span className="text-sm text-textSecondary">{ t('chatInput.buttons.quickMode') }</span>
          </label>
        ) }

        { showUploader && (
          <Tooltip content={ t('chatInput.buttons.uploadFile') }>
            <Uploader
              onChange={ onFilesChange }
              onRemove={ onFileRemove }
              pasteEls={ [textareaRef] }
              dragAreaEl={ chatInputAreaRef }
              renderChildrenWithDragArea
              multiple
              accept="image/*"
              placeholder=""
            >
              <button
                className={ cn(
                  'p-2 rounded-xl transition-all duration-200',
                  'text-textSecondary hover:text-textPrimary',
                  'dark:text-textSecondary dark:hover:text-textPrimary',
                  'hover:bg-backgroundSubtle dark:hover:bg-backgroundSubtle hover:scale-105',
                ) }
              >
                <Paperclip size={ 18 } />
              </button>
            </Uploader>
          </Tooltip>
        ) }

        { voiceControl }

        {/* 发送按钮 */ }
        <Button
          loading={ loading }
          disabled={ disabled || !actualValue.trim() }
          variant="primary"
          size="sm"
          className="shrink-0"
          rightIcon={ <ArrowUpFromDot size={ 17 } /> }
          rounded="full"
          onClick={ onSubmit }
        >
        </Button>
      </div>
    </div>
  )
})

BottomBar.displayName = 'BottomBar'
