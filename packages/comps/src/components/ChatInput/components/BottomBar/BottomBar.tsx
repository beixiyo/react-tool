import type {
  BottomBarLatestState,
  BottomBarProps,
  BottomBarRenderContext,
} from '../../types'
import { memo } from 'react'
import { useT } from '../../../../i18n'
import { BottomBarContext } from './BottomBarContext'
import { BottomBarIconButton } from './BottomBarIconButton'
import { DefaultActions } from './DefaultActions'
import { HelperButton } from './HelperButton'
import { HistoryButton } from './HistoryButton'
import { PromptButton } from './PromptButton'
import { SendButton } from './SendButton'
import { UploaderButton } from './UploaderButton'
import { VoiceControl } from './VoiceControl'

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
    allowEmptySubmit,
    loading,
    disabled,
    renderActions,
    shortcuts,
  } = props

  const t = useT()

  const bottomBarState: BottomBarLatestState = {
    t,
    enablePromptTemplates: props.enablePromptTemplates,
    enableHistory: props.enableHistory,
    enableUploader: props.enableUploader,
    enableHelper: props.enableHelper,
    loading,
    disabled,
    actualValue,
    allowEmptySubmit,
    shortcuts,
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

  const ctx: BottomBarRenderContext = {
    VoiceControl,
    SendButton,
    UploaderButton,
    PromptButton,
    HistoryButton,
    HelperButton,
    DefaultActions,
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

  return (
    <BottomBarContext.Provider value={ bottomBarState }>
      <div className="flex h-10 w-full shrink-0 items-center justify-between gap-2 px-3 pb-2">
        { renderActions
          ? renderActions(ctx)
          : <DefaultActions /> }
      </div>
    </BottomBarContext.Provider>
  )
})

BottomBar.displayName = 'BottomBar'
