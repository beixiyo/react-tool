import type { BottomBarActionProps } from '../../types'
import { memo } from 'react'
import { useBottomBarState } from './BottomBarContext'

export const VoiceControl = memo<BottomBarActionProps>((props) => {
  const { voiceControl } = useBottomBarState()

  if (!voiceControl)
    return null

  return voiceControl(props)
})

VoiceControl.displayName = 'BottomBar.VoiceControl'
