export type Size = 'sm' | 'md' | 'lg' | number
export type SizeStyle = Record<Exclude<Size, number>, string>

export type Rounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
export type RoundedStyle = Record<Rounded, string>

export type AsChildProps<BaseProps, ChildProps>
  = ({ asChild: true } & BaseProps)
    | ({ asChild: false } & BaseProps & ChildProps)
