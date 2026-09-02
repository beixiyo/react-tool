/** ChatInput 面板共用的加载与空状态。 */

import type { LucideIcon } from 'lucide-react'
import { LoaderCircle } from 'lucide-react'
import { memo } from 'react'

export const PanelState = memo<PanelStateProps>(({ icon: Icon, title, description, loading = false }) => (
  <div
    className="flex min-h-36 flex-col items-center justify-center px-6 py-8 text-center"
    role={ loading
      ? 'status'
      : undefined }
  >
    { loading
      ? <LoaderCircle className="mb-3 size-5 animate-spin text-brand" />
      : <Icon className="mb-3 size-5 text-brand/80" /> }
    <p className="text-sm font-medium text-text">{ title }</p>
    { description && <p className="mt-1 max-w-72 text-xs leading-5 text-text2">{ description }</p> }
  </div>
))

PanelState.displayName = 'PanelState'

type PanelStateProps = {
  icon: LucideIcon
  title: string
  description?: string
  loading?: boolean
}
