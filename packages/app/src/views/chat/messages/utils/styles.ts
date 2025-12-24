import type { ChatMessage } from '../../types'
import { cn } from 'utils'

/**
 * 获取消息的背景样式类名
 */
export function getMessageBackgroundClasses(message: ChatMessage, isUser: boolean): (string | false | undefined)[] {
  return [
    'bg-slate-50 dark:bg-slate-800',
    isUser
      ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tr-none'
      : 'text-slate-800 dark:text-slate-200',
    message.type === 'thinking-start' && 'bg-slate-50/70 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50',
    message.type === 'thinking-end' && 'bg-slate-50/70 dark:bg-slate-800/20 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50',
    message.type === 'loading' && 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  ]
}

/**
 * 获取用户消息容器的样式类名
 */
export function getUserMessageContainerClasses(message: ChatMessage): string {
  return cn(
    message.type === 'card'
      ? 'rounded-2xl relative'
      : 'p-3 rounded-2xl relative',
    message.type === 'card' && [
      'bg-white dark:bg-gray-800',
      message.card?.variant === 'info' && 'border-l-4 border-l-blue-500',
      message.card?.variant === 'success' && 'border-l-4 border-l-green-500',
      message.card?.variant === 'warning' && 'border-l-4 border-l-amber-500',
      message.card?.variant === 'error' && 'border-l-4 border-l-red-500',
      (!message.card?.variant || message.card?.variant === 'default') && 'border-l-4 border-l-emerald-500',
    ],
  )
}

/**
 * 获取卡片样式类名
 */
export function getCardClasses(message: ChatMessage, isUser: boolean): string {
  const { card } = message
  if (!card)
    return ''

  return cn(
    'rounded-xl border transition-all duration-200',
    isUser && 'h-full',
    !isUser && 'my-2 w-fit',
    card.bordered !== false && 'border-slate-200 dark:border-slate-700',
    !card.bordered && 'border-transparent',
    card.variant === 'info' && 'border-blue-200 dark:border-blue-800',
    card.variant === 'success' && 'border-green-200 dark:border-green-800',
    card.variant === 'warning' && 'border-amber-200 dark:border-amber-800',
    card.variant === 'error' && 'border-red-200 dark:border-red-800',
    (!card.variant || card.variant === 'default') && 'border-slate-200 dark:border-slate-700',
  )
}

/**
 * 获取卡片头部样式类名
 */
export function getCardHeaderIconClasses(card: ChatMessage['card']): string {
  if (!card)
    return ''

  return cn(
    'flex items-center justify-center',
    card.variant === 'info' && 'text-blue-600 dark:text-blue-400',
    card.variant === 'success' && 'text-green-600 dark:text-green-400',
    card.variant === 'warning' && 'text-amber-600 dark:text-amber-400',
    card.variant === 'error' && 'text-red-600 dark:text-red-400',
    (!card.variant || card.variant === 'default') && 'text-slate-600 dark:text-slate-400',
  )
}

/**
 * 获取卡片标题样式类名
 */
export function getCardTitleClasses(card: ChatMessage['card']): string {
  if (!card)
    return ''

  return cn(
    'font-semibold text-sm',
    card.variant === 'info' && 'text-blue-900 dark:text-blue-100',
    card.variant === 'success' && 'text-green-900 dark:text-green-100',
    card.variant === 'warning' && 'text-amber-900 dark:text-amber-100',
    card.variant === 'error' && 'text-red-900 dark:text-red-100',
    (!card.variant || card.variant === 'default') && 'text-slate-900 dark:text-slate-100',
  )
}

/**
 * 获取卡片描述样式类名
 */
export function getCardDescriptionClasses(card: ChatMessage['card']): string {
  if (!card)
    return ''

  return cn(
    'px-4 text-sm',
    !card.title && !card.icon && 'pt-4',
    card.variant === 'info' && 'text-blue-700 dark:text-blue-300',
    card.variant === 'success' && 'text-green-700 dark:text-green-300',
    card.variant === 'warning' && 'text-amber-700 dark:text-amber-300',
    card.variant === 'error' && 'text-red-700 dark:text-red-300',
    (!card.variant || card.variant === 'default') && 'text-slate-600 dark:text-slate-300',
  )
}

/**
 * 获取卡片内容容器样式类名
 */
export function getCardContentClasses(card: ChatMessage['card'], isUser: boolean): string {
  if (!card)
    return ''

  return cn(
    isUser
      ? 'px-4'
      : 'p-4',
    !card.title && !card.icon && !card.description && 'pt-4',
    card.description && 'pt-2',
    (!card.description && (card.title || card.icon)) && 'pt-1',
  )
}
