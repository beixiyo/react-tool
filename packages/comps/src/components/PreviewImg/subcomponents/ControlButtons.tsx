'use client'

import { Copy, Download, RefreshCw, RotateCw } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { useAriaT } from '../../../i18n'
import { Tooltip } from '../../Tooltip'
import type { ControlButtonName, PreviewImgOverlayCtx, PreviewToolbarItem } from '../types'

/** 与内置工具栏按钮共享样式的按钮 */
export const PreviewToolbarButton = memo<PreviewToolbarButtonProps>(({
  className,
  children,
  ...rest
}) => (
  <button
    type="button"
    className={ cn(
      'flex shrink-0 items-center justify-center rounded-[10px] p-1.5',
      'text-background transition-colors hover:bg-background/15 disabled:cursor-not-allowed disabled:opacity-40 dark:text-text dark:hover:bg-text/10',
      className,
    ) }
    { ...rest }
  >
    { children }
  </button>
))

PreviewToolbarButton.displayName = 'PreviewToolbarButton'

/** 按调用方指定的顺序渲染内置与自定义按钮 */
export const ControlButtons = memo<ControlButtonsProps>(({ items, ctx, icons, disabled, className, tooltipZIndex, tooltip = true }) => {
  const t = useAriaT()
  const builtins = {
    rotate: { label: t('rotateImage'), icon: <RotateCw size={ 20 } strokeWidth={ 2 } />, action: ctx.rotate },
    reset: { label: t('resetImage'), icon: <RefreshCw size={ 20 } strokeWidth={ 2 } />, action: ctx.reset },
    copy: { label: t('copyImage'), icon: <Copy size={ 20 } strokeWidth={ 2 } />, action: ctx.copy },
    download: { label: t('downloadImage'), icon: <Download size={ 20 } strokeWidth={ 2 } />, action: ctx.download },
  }

  if (items.length === 0) return null

  return (
    <div
      className={ cn(
        'flex items-center gap-2 rounded-xl bg-text px-2 py-1 dark:bg-background3 dark:ring-1 dark:ring-border',
        'shadow-[0px_8px_24px_rgb(0_0_0/0.15)]',
        className,
      ) }
    >
      { items.map((item) => {
        const name = typeof item === 'string'
          ? item
          : 'name' in item
          ? item.name
          : undefined
        const showTooltip = typeof item === 'string'
          ? tooltip
          : item.tooltip ?? tooltip

        if (name) {
          const builtin = builtins[name]
          const button = (
            <PreviewToolbarButton
              aria-label={ builtin.label }
              disabled={ disabled && (name === 'copy' || name === 'download') }
              onClick={ () => {
                void builtin.action()
              } }
            >
              { icons?.[name] ?? builtin.icon }
            </PreviewToolbarButton>
          )
          return showTooltip
            ? <Tooltip key={ name } content={ builtin.label } zIndex={ tooltipZIndex }>{ button }</Tooltip>
            : <span key={ name } className="inline-block">{ button }</span>
        }

        if (typeof item === 'string' || 'name' in item) return null
        const button = (
          <PreviewToolbarButton
            aria-label={ item.label }
            disabled={ item.disabled }
            onClick={ () => item.onClick(ctx) }
            className={ item.text != null
              ? 'gap-1.5 text-sm font-medium'
              : undefined }
          >
            { item.icon }
            { item.text }
          </PreviewToolbarButton>
        )
        return showTooltip
          ? <Tooltip key={ item.key } content={ item.label } zIndex={ tooltipZIndex }>{ button }</Tooltip>
          : <span key={ item.key } className="inline-block">{ button }</span>
      }) }
    </div>
  )
})

ControlButtons.displayName = 'ControlButtons'

export type PreviewToolbarButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

interface ControlButtonsProps {
  items: readonly PreviewToolbarItem[]
  ctx: PreviewImgOverlayCtx
  icons?: Partial<Record<ControlButtonName, React.ReactNode>>
  disabled?: boolean
  className?: string
  tooltipZIndex?: number
  tooltip?: boolean
}
