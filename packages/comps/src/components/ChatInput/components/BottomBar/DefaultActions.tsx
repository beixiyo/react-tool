import { memo } from 'react'
import { useBottomBarState } from './BottomBarContext'
import { HelperButton } from './HelperButton'
import { HistoryButton } from './HistoryButton'
import { PromptButton } from './PromptButton'
import { SendButton } from './SendButton'
import { UploaderButton } from './UploaderButton'
import { VoiceControl } from './VoiceControl'

export const DefaultActions = memo(() => {
  const {
    enablePromptTemplates,
    enableHistory,
    enableUploader,
    enableHelper,
  } = useBottomBarState()

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
})

DefaultActions.displayName = 'BottomBar.DefaultActions'
