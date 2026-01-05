import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import type { BadgeVariant, BadgeSize } from './types'
import { badgeVariants } from './styles'

/**
 * Lit Badge 组件
 */
@customElement('l-badge')
export class LBadge extends LitElement {
  @property({ type: Number })
  count?: number

  @property({ type: Boolean })
  dot = false

  @property({ type: Number })
  maxCount = 99

  @property({ type: Boolean })
  showZero = false

  @property({ type: String })
  variant: BadgeVariant = 'default'

  @property({ type: String })
  size: BadgeSize = 'md'

  @property({ type: String })
  content?: string

  /**
   * 禁用 Shadow DOM，使 Tailwind 样式能够应用
   */
  createRenderRoot() {
    return this
  }

  connectedCallback() {
    super.connectedCallback()
    // 设置组件本身的样式，确保定位正确
    this.style.display = 'inline-flex'
  }

  render() {
    // 点状显示
    if (this.dot) {
      return html`
        <div class="relative inline-flex">
          <div class="${badgeVariants({ variant: this.variant, size: this.size })} absolute -right-1 -top-1 h-2 w-2 p-0"></div>
          <slot></slot>
        </div>
      `
    }

    // 计算显示内容
    const displayCount = this.count !== undefined && this.count > this.maxCount
      ? `${this.maxCount}+`
      : this.count

    // 如果没有内容且不显示零，则不渲染徽章
    if (!this.count && !this.showZero && !this.content) {
      return html`<slot></slot>`
    }

    // 数字或自定义内容徽章
    return html`
      <div class="relative inline-flex">
        <slot></slot>
        <div class="${badgeVariants({ variant: this.variant, size: this.size })} absolute -right-2 -top-2">
          ${this.content || displayCount}
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-badge': LBadge
  }
}

