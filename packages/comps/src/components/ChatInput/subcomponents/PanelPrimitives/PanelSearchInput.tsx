import type { Ref } from 'react'
/** ChatInput 面板共用的受控搜索框 */

import { Search, X } from 'lucide-react'
import { memo } from 'react'
import { Input } from '../../../Input'

const InnerPanelSearchInput = ({ ref, value, placeholder, clearLabel, controls, activeDescendant, onChange, onClear }: PanelSearchInputProps) => (
  <Input
    ref={ ref }
    type="search"
    size="sm"
    rounded="lg"
    value={ value }
    placeholder={ placeholder }
    aria-controls={ controls }
    aria-activedescendant={ activeDescendant }
    aria-autocomplete="list"
    role="combobox"
    prefix={ <Search className="size-4" /> }
    suffix={ value
      ? (
        <button
          type="button"
          aria-label={ clearLabel }
          className="flex size-6 items-center justify-center rounded-md text-text2 transition-colors hover:bg-background3 hover:text-text focus-visible:ring-1 focus-visible:ring-border2 focus-visible:outline-none"
          onMouseDown={ (event) => event.preventDefault() }
          onClick={ onClear }
        >
          <X className="size-4" />
        </button>
      )
      : undefined }
    onChange={ onChange }
  />
)

export const PanelSearchInput = memo(InnerPanelSearchInput)
PanelSearchInput.displayName = 'PanelSearchInput'

type PanelSearchInputProps = {
  ref?: Ref<HTMLInputElement>
  value: string
  placeholder: string
  clearLabel: string
  controls: string
  activeDescendant?: string
  onChange: (value: string) => void
  onClear: () => void
}
