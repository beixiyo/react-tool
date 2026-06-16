import type { BottomBarPartProps } from '../../types'
import { memo } from 'react'
import { useBottomBarState } from './BottomBarContext'

export const VoiceControl = memo<BottomBarPartProps>(({ className }) => {
  const { voiceControl } = useBottomBarState()

  if (!voiceControl)
    return null

  return className
    ? <span className={ className }>{ voiceControl }</span>
    : <>{ voiceControl }</>
})

VoiceControl.displayName = 'BottomBar.VoiceControl'
