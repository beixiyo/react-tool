import type { ReactNode, RefObject } from 'react'
import { ArrowUpFromDot, Command, HelpCircle, History, Paperclip, Sparkles } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Button, Tooltip, Uploader } from '../..'
import { useT } from '../../../i18n'
import { formatShortcut } from '../constants'

export type BottomBarProps = {
  bottomBarHeight: number
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
  voiceControl?: ReactNode
}

export const BottomBar = memo<BottomBarProps>((
  {
    bottomBarHeight,
    enablePromptTemplates,
    enableHistory,
    enableUploader,
    enableHelper,
    loading,
    disabled,
    actualValue,
    showPromptPanel,
    showHistoryPanel,
    textareaRef,
    chatInputAreaRef,
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
      { voiceControl }

      { enableHelper && (
        /* 快捷键提示 - 悬浮显示 */
        <Tooltip
          content={
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div className="rounded-sm bg-gray-700 px-1 py-0.5 text-xs">{ formatShortcut('/') }</div>
                <Sparkles size={ 12 } />
                { t('chatInput.shortcuts.templates') }
              </span>
              <span className="flex items-center gap-1">
                <div className="rounded-sm bg-gray-700 px-1 py-0.5 text-xs">{ formatShortcut('H') }</div>
                <History size={ 12 } />
                { t('chatInput.shortcuts.history') }
              </span>
              <span className="flex items-center gap-1">
                <div className="rounded-sm bg-gray-700 px-1 py-0.5 text-xs">{ formatShortcut('Enter') }</div>
                <ArrowUpFromDot size={ 12 } />
                { t('chatInput.shortcuts.send') }
              </span>
            </div>
          }
        >
          <button
            style={ {
              translate: '0px 3px',
            } }
            className={ cn(
              'rounded-xl transition-all duration-200 cursor-help',
              'text-text2 hover:text-text',
              'dark:text-text2 dark:hover:text-text hover:scale-105',
            ) }
          >
            <HelpCircle size={ 22 } strokeWidth={ 1.5 } />
          </button>
        </Tooltip>
      ) }

      {/* 功能按钮 */ }
      <div className="ml-auto flex items-center gap-2">
        { enablePromptTemplates && (
          <Tooltip content={ <div className="flex items-center gap-2">
            <Command size={ 12 } />
            <div className="rounded-sm bg-gray-700 px-1 py-0.5 text-xs">{ formatShortcut('/') }</div>
            { t('chatInput.buttons.promptTemplates') }
          </div> }>
            <button
              onClick={ onShowPromptPanelToggle }
              className={ cn(
                'p-2 rounded-xl transition-all duration-200',
                'text-text2 hover:text-text',
                'dark:text-text2 dark:hover:text-text',
                'hover:bg-background2 dark:hover:bg-background2 hover:scale-105',
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
            <div className="rounded-sm bg-gray-700 px-1 py-0.5 text-xs">{ formatShortcut('H') }</div>
            { t('chatInput.buttons.inputHistory') }
          </div> }>
            <button
              onClick={ onShowHistoryPanelToggle }
              className={ cn(
                'p-2 rounded-xl transition-all duration-200',
                'text-text2 hover:text-text',
                'dark:text-text2 dark:hover:text-text',
                'hover:bg-background2 dark:hover:bg-background2 hover:scale-105',
                showHistoryPanel && 'text-success bg-successBg/30 dark:bg-successBg/30 scale-105',
              ) }
            >
              <History size={ 18 } />
            </button>
          </Tooltip>
        ) }

        { enableUploader && (
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
                  'text-text2 hover:text-text',
                  'dark:text-text2 dark:hover:text-text',
                  'hover:bg-background2 dark:hover:bg-background2 hover:scale-105',
                ) }
              >
                <Paperclip size={ 18 } />
              </button>
            </Uploader>
          </Tooltip>
        ) }

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
