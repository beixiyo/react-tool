'use client'

import { memo } from 'react'
import { cn } from 'utils'
import { useAriaT } from '../../../i18n'

/**
 * 大图左右两侧的「上一张 / 下一张」白色箭头
 */
export const NavArrows = memo<NavArrowsProps>(({ onPrev, onNext, className }) => {
  const t = useAriaT()

  return (
    <>
      <NavArrowButton
        direction="prev"
        aria-label={ t('previousImage') }
        onClick={ onPrev }
        className={ className }
      />
      <NavArrowButton
        direction="next"
        aria-label={ t('nextImage') }
        onClick={ onNext }
        className={ className }
      />
    </>
  )
})

NavArrows.displayName = 'NavArrows'

const NavArrowButton = memo<NavArrowButtonProps>(({ direction, className, onClick, ...rest }) => {
  const isPrev = direction === 'prev'

  return (
    <button
      type="button"
      className={ cn(
        /** 点击区 40×40，图标 20×20 居中；垂直居中于视口，即与居中的大图同心 */
        'fixed top-1/2 z-modal pointer-events-auto flex size-10 -translate-y-1/2 items-center justify-center',
        'rounded-full text-white opacity-80 transition-opacity hover:opacity-100',
        isPrev
          ? 'left-[max(16px,calc(50%-497px))]'
          : 'right-[max(16px,calc(50%-497px))]',
        className,
      ) }
      onClick={ (e) => {
        /** 不让点击冒泡到遮罩（遮罩点击会关闭预览） */
        e.stopPropagation()
        onClick()
      } }
      { ...rest }
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d={ isPrev
            ? 'M13 4.5L7.5 10L13 15.5'
            : 'M7 4.5L12.5 10L7 15.5' }
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
})

NavArrowButton.displayName = 'NavArrowButton'

type NavArrowsProps = {
  onPrev: () => void
  onNext: () => void
  /** 同时作用于两个箭头按钮 */
  className?: string
}

type NavArrowButtonProps = {
  direction: 'prev' | 'next'
  onClick: () => void
  className?: string
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>
