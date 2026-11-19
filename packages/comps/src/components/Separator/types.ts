export type Orientation = 'horizontal' | 'vertical'

export interface SeparatorProps extends React.ComponentPropsWithRef<'div'> {
  orientation?: Orientation
  decorative?: boolean
  containerClassName?: string
}
