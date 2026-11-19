export type SpacerOrientation = 'horizontal' | 'vertical'

export interface SpacerProps extends React.ComponentPropsWithoutRef<'div'> {
  orientation?: SpacerOrientation
  size?: string | number
}
