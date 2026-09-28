export type SpacerOrientation = 'horizontal' | 'vertical'

export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: SpacerOrientation
  size?: string | number
}
