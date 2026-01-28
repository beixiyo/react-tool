'use client'

export type SpacerOrientation = 'horizontal' | 'vertical'

export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: SpacerOrientation
  size?: string | number
}

export function Spacer({
  orientation = 'horizontal',
  size,
  style = {},
  ...props
}: SpacerProps) {
  const computedStyle: React.CSSProperties = {
    ...style,
    ...(orientation === 'horizontal' && !size && { flex: 1, width: '100%' }),
    ...(size && {
      width: orientation === 'vertical'
        ? '1px'
        : size,
      height: orientation === 'horizontal'
        ? '1px'
        : size,
    }),
  }

  return <div { ...props } style={ computedStyle } />
}
