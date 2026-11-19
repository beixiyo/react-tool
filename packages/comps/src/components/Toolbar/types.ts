import type * as React from 'react'

export type BaseProps = React.ComponentPropsWithRef<'div'>

export interface ToolbarProps extends BaseProps {
  variant?: 'floating' | 'fixed'
}
