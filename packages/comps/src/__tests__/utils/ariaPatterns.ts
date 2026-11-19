/**
 * WAI-ARIA 复合组件契约的轻量断言工具（仅测试使用）
 *
 * 只检查读屏和键盘用户能直接感知的结构性契约：role 层级、可访问名、ID 引用、
 * 状态属性与 role 的匹配、roving tabindex。不计算完整 accname 算法，也不检查样式
 */
import { expect } from 'vitest'

/**
 * 获取元素的有效 role：显式 `role` 的第一个 token 优先，否则按常用原生元素推断隐式 role
 */
export function getRole(el: Element): string {
  const explicit = el.getAttribute('role')?.trim().split(/\s+/)[0]
  if (explicit) return explicit

  const tag = el.tagName.toLowerCase()
  switch (tag) {
    case 'button':
      return 'button'
    case 'a':
      return el.hasAttribute('href')
        ? 'link'
        : 'generic'
    case 'dialog':
      return 'dialog'
    case 'select':
      return (el as HTMLSelectElement).multiple
        ? 'listbox'
        : 'combobox'
    case 'textarea':
      return 'textbox'
    case 'option':
      return 'option'
    case 'tr':
      return 'row'
    case 'td':
      return 'cell'
    case 'th':
      return 'columnheader'
    case 'ul':
    case 'ol':
      return 'list'
    case 'li':
      return 'listitem'
    case 'input': {
      const type = (el.getAttribute('type') ?? 'text').toLowerCase()
      if (type === 'checkbox') return 'checkbox'
      if (type === 'radio') return 'radio'
      if (type === 'button' || type === 'submit' || type === 'reset') return 'button'
      if (type === 'hidden') return 'none'
      return el.hasAttribute('list')
        ? 'combobox'
        : 'textbox'
    }
    default:
      return 'generic'
  }
}

/**
 * 简化版可访问名计算：aria-labelledby > aria-label > 原生 label / alt > 内容（仅 name-from-content 角色）> title / placeholder
 */
export function getAccessibleName(el: Element): string {
  const doc = el.ownerDocument

  const labelledby = el.getAttribute('aria-labelledby')
  if (labelledby) {
    const text = splitIds(labelledby)
      .map((id) => doc.getElementById(id))
      .filter((node): node is HTMLElement => !!node)
      .map((node) => node.getAttribute('aria-label')?.trim() || getTextAlternative(node))
      .join(' ')
      .trim()
    if (text) return text
  }

  const label = el.getAttribute('aria-label')?.trim()
  if (label) return label

  if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
    const text = Array.from(el.labels ?? []).map(getTextAlternative).join(' ').trim()
    if (text) return text
  }

  if (el instanceof HTMLImageElement && el.alt.trim()) return el.alt.trim()

  if (NAME_FROM_CONTENT_ROLES.has(getRole(el))) {
    const text = getTextAlternative(el)
    if (text) return text
  }

  return el.getAttribute('title')?.trim()
    || el.getAttribute('placeholder')?.trim()
    || ''
}

/**
 * 计算 `root` 内某种模式的全部契约违规项，返回可读的违规描述列表（空数组代表通过）
 *
 * `root` 可以是模式容器本身（如 `role="tablist"` 节点），也可以是包含它的祖先（如 render 的 container 或 `document.body`）
 */
export function getAriaViolations(root: Element, pattern: AriaPattern, options: AriaPatternOptions = {}): string[] {
  const violations: string[] = []
  const containerRoles = PATTERN_CONTAINER_ROLES[pattern]
  const containers = getSubtree(root).filter((el) => containerRoles.includes(getRole(el)))

  if (containers.length === 0) {
    return [`${pattern}: no element with role ${containerRoles.join(' / ')} found`]
  }

  checkIdRefs(root, violations)
  checkStateAttributes(root, violations)

  for (const container of containers) {
    PATTERN_CHECKERS[pattern](container, options, violations)
  }

  return Array.from(new Set(violations))
}

/**
 * 断言 `root` 内的某种 ARIA 模式符合契约，失败时一次性列出所有违规项
 *
 * @example
 * expectPattern(screen.getByRole('tablist'), 'tabs')
 * expectPattern(document.body, 'dialog', { modal: false })
 */
export function expectPattern(root: Element, pattern: AriaPattern, options?: AriaPatternOptions) {
  expect(getAriaViolations(root, pattern, options), `${pattern} pattern violations`).toEqual([])
}

/**
 * 只扫描 `root` 子树内 aria-controls / aria-labelledby / aria-describedby / aria-activedescendant / aria-owns
 * 的悬空引用，适用于不属于上述复合模式的浮层（如 tooltip）
 */
export function getIdRefViolations(root: Element): string[] {
  const violations: string[] = []
  checkIdRefs(root, violations)
  return violations
}

/**
 * 元素当前是否处于 Tab 序列中（tabIndex >= 0、未禁用、不在 hidden / inert 子树内）
 */
export function isTabbable(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false
  if (el.tabIndex < 0) return false
  if ((el as HTMLButtonElement).disabled) return false
  return !el.closest('[hidden], [inert]')
}

/* ---------------------------------- 模式检查 ---------------------------------- */

function checkTabs(tablist: Element, options: AriaPatternOptions, violations: string[]) {
  const tabs = getOwned(tablist, ['tab'], ['tablist'])
  if (tabs.length === 0) violations.push(`tabs: ${describe(tablist)} owns no tab`)

  /** tablist 只应拥有 tab：其它可交互元素会让读屏把它误报成标签列表的一部分 */
  getSubtree(tablist)
    .filter((el) => el !== tablist && isInteractive(el) && getRole(el) !== 'tab' && !el.parentElement?.closest('[role="tab"]'))
    .forEach((el) => violations.push(`tabs: tablist contains non-tab interactive element ${describe(el)}`))

  tabs.forEach((tab) => {
    requireName(tab, 'tabs', violations)
    if (!['true', 'false'].includes(tab.getAttribute('aria-selected') ?? '')) {
      violations.push(`tabs: ${describe(tab)} must set aria-selected="true|false"`)
    }

    splitIds(tab.getAttribute('aria-controls')).forEach((id) => {
      const panel = tab.ownerDocument.getElementById(id)
      if (panel && getRole(panel) !== 'tabpanel') {
        violations.push(`tabs: ${describe(tab)} aria-controls points to ${describe(panel)}, expected tabpanel`)
      }
      if (panel && !splitIds(panel.getAttribute('aria-labelledby')).includes(tab.id)) {
        violations.push(`tabs: ${describe(panel)} should be aria-labelledby its tab #${tab.id}`)
      }
    })
  })

  checkSingleSelection(tablist, tabs, 'tabs', violations)
  checkRoving(tabs, options.roving ?? true, 'tabs', violations)
}

function checkListbox(listbox: Element, options: AriaPatternOptions, violations: string[]) {
  const items = getOwned(listbox, ['option'], ['listbox'])
  if (items.length === 0 && !options.allowEmpty) violations.push(`listbox: ${describe(listbox)} owns no option`)
  requireName(listbox, 'listbox', violations, options.requireName ?? true)

  items.forEach((item) => requireName(item, 'listbox', violations))
  checkSingleSelection(listbox, items, 'listbox', violations)
  checkRoving(items, options.roving ?? false, 'listbox', violations)
}

function checkCombobox(combobox: Element, options: AriaPatternOptions, violations: string[]) {
  requireName(combobox, 'combobox', violations, options.requireName ?? true)

  const expanded = combobox.getAttribute('aria-expanded')
  if (expanded !== 'true' && expanded !== 'false') {
    violations.push(`combobox: ${describe(combobox)} must set aria-expanded="true|false"`)
  }

  const doc = combobox.ownerDocument
  const popups = splitIds(combobox.getAttribute('aria-controls'))
    .map((id) => doc.getElementById(id))
    .filter((el): el is HTMLElement => !!el)

  if (expanded === 'true') {
    if (popups.length === 0) violations.push(`combobox: expanded ${describe(combobox)} must aria-controls its popup`)
    popups.forEach((popup) => {
      if (!COMBOBOX_POPUP_ROLES.includes(getRole(popup))) {
        violations.push(`combobox: aria-controls points to ${describe(popup)}, expected ${COMBOBOX_POPUP_ROLES.join(' / ')}`)
      }
      if (getRole(popup) === 'listbox') checkListbox(popup, { ...options, roving: false, requireName: true }, violations)
    })
  }

  const activeId = combobox.getAttribute('aria-activedescendant')
  if (activeId && expanded !== 'true') {
    violations.push(`combobox: collapsed ${describe(combobox)} keeps stale aria-activedescendant`)
  }

  const active = activeId
    ? doc.getElementById(activeId)
    : null
  if (active && expanded === 'true') {
    if (!popups.some((popup) => popup.contains(active))) {
      violations.push(`combobox: aria-activedescendant ${describe(active)} is outside controlled popup`)
    }
    if (!['option', 'gridcell', 'treeitem', 'row'].includes(getRole(active))) {
      violations.push(`combobox: aria-activedescendant points to ${describe(active)}, expected option`)
    }
    if (active.getAttribute('aria-disabled') === 'true') {
      violations.push(`combobox: aria-activedescendant points to disabled ${describe(active)}`)
    }
  }
}

function checkMenu(menu: Element, options: AriaPatternOptions, violations: string[]) {
  const items = getOwned(menu, MENU_ITEM_ROLES, ['menu', 'menubar'])
  if (items.length === 0) violations.push(`menu: ${describe(menu)} owns no menuitem`)
  requireName(menu, 'menu', violations, options.requireName ?? false)

  items.forEach((item) => {
    requireName(item, 'menu', violations)
    if (getRole(item) !== 'menuitem' && !['true', 'false'].includes(item.getAttribute('aria-checked') ?? '')) {
      violations.push(`menu: ${describe(item)} must set aria-checked="true|false"`)
    }
  })

  /** 菜单内焦点由方向键管理，Tab 序列里最多保留一个入口 */
  const tabbable = getSubtree(menu).filter((el) => el !== menu && isTabbable(el))
  if (tabbable.length > 1) {
    violations.push(`menu: ${describe(menu)} has ${tabbable.length} tabbable descendants, expected at most 1`)
  }
  checkRoving(items, options.roving ?? false, 'menu', violations)
}

function checkDialog(dialog: Element, options: AriaPatternOptions, violations: string[]) {
  requireName(dialog, 'dialog', violations, options.requireName ?? true)
  if ((options.modal ?? true) && dialog.getAttribute('aria-modal') !== 'true') {
    violations.push(`dialog: modal ${describe(dialog)} must set aria-modal="true"`)
  }
}

function checkGrid(grid: Element, options: AriaPatternOptions, violations: string[]) {
  requireName(grid, 'grid', violations, options.requireName ?? true)

  const rows = getOwned(grid, ['row'], ['grid', 'treegrid'])
  if (rows.length === 0) violations.push(`grid: ${describe(grid)} owns no row`)

  rows.forEach((row) => {
    if (getOwned(row, GRID_CELL_ROLES, ['row']).length === 0) violations.push(`grid: ${describe(row)} owns no cell`)
  })

  getSubtree(grid)
    .filter((el) => GRID_CELL_ROLES.includes(getRole(el)))
    .forEach((cell) => {
      const row = cell.parentElement?.closest('[role="row"]')
      if (!row || !grid.contains(row)) violations.push(`grid: ${describe(cell)} is not inside a row`)
    })

  /** 网格整体只占一个 Tab 停靠点，内部用方向键移动 */
  const tabbable = getSubtree(grid).filter((el) => el !== grid && isTabbable(el))
  if ((options.roving ?? true) && tabbable.length !== 1) {
    violations.push(`grid: expected exactly 1 tabbable element in ${describe(grid)}, got ${tabbable.length}`)
  }
}

/* ---------------------------------- 通用检查 ---------------------------------- */

/** ID 引用类属性指向的节点必须存在于文档中 */
function checkIdRefs(root: Element, violations: string[]) {
  const doc = root.ownerDocument
  getSubtree(root).forEach((el) => {
    IDREF_ATTRS.forEach((attr) => {
      splitIds(el.getAttribute(attr)).forEach((id) => {
        if (!doc.getElementById(id)) violations.push(`idref: ${describe(el)} ${attr}="${id}" points to missing element`)
      })
    })
  })
}

/** 状态属性只能出现在支持它的 role 上 */
function checkStateAttributes(root: Element, violations: string[]) {
  getSubtree(root).forEach((el) => {
    const role = getRole(el)
    Object.entries(STATE_ALLOWED_ROLES).forEach(([attr, roles]) => {
      if (el.hasAttribute(attr) && !roles.includes(role)) {
        violations.push(`state: ${attr} is not supported on role "${role}" (${describe(el)})`)
      }
    })
  })
}

function checkSingleSelection(container: Element, items: Element[], pattern: string, violations: string[]) {
  if (container.getAttribute('aria-multiselectable') === 'true') return
  const selected = items.filter((item) => item.getAttribute('aria-selected') === 'true')
  if (selected.length > 1) {
    violations.push(`${pattern}: ${describe(container)} is single-select but has ${selected.length} aria-selected items`)
  }
}

function checkRoving(items: Element[], enabled: boolean, pattern: string, violations: string[]) {
  if (!enabled || items.length === 0) return
  const tabbable = items.filter((item) => (item as HTMLElement).tabIndex === 0)
  if (tabbable.length !== 1) {
    violations.push(`${pattern}: roving tabindex expects exactly 1 item with tabIndex=0, got ${tabbable.length}`)
  }
}

function requireName(el: Element, pattern: string, violations: string[], required = true) {
  if (required && !getAccessibleName(el)) violations.push(`${pattern}: ${describe(el)} has no accessible name`)
}

/* ---------------------------------- DOM 工具 ---------------------------------- */

function getSubtree(root: Element): Element[] {
  return [root, ...Array.from(root.querySelectorAll('*'))]
}

/** 取 `container` 拥有的指定 role 子项：最近的同类容器必须是它自己，避免把嵌套子菜单 / 子列表算进来 */
function getOwned(container: Element, itemRoles: string[], containerRoles: string[]): Element[] {
  return getSubtree(container).filter((el) => {
    if (el === container || !itemRoles.includes(getRole(el))) return false
    let parent = el.parentElement
    while (parent && !containerRoles.includes(getRole(parent))) parent = parent.parentElement
    return parent === container
  })
}

function isInteractive(el: Element): boolean {
  if (el.closest('[hidden], [inert], [aria-hidden="true"]')) return false
  return INTERACTIVE_ROLES.has(getRole(el)) || el.hasAttribute('tabindex')
}

/** 文本替代：跳过 aria-hidden 子树，子元素自带 aria-label 时取其 label */
function getTextAlternative(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
  if (!(node instanceof Element)) return ''
  if (node.getAttribute('aria-hidden') === 'true') return ''

  const label = node.getAttribute('aria-label')?.trim()
  if (label) return label

  return Array.from(node.childNodes).map(getTextAlternative).join('').replace(/\s+/g, ' ').trim()
}

function splitIds(value: string | null | undefined): string[] {
  return value?.trim().split(/\s+/).filter(Boolean) ?? []
}

function describe(el: Element): string {
  const role = getRole(el)
  const id = el.id
    ? `#${el.id}`
    : ''
  const name = getAccessibleNameSafe(el)
  return `<${el.tagName.toLowerCase()}${id} role=${role}${
    name
      ? ` "${name.slice(0, 30)}"`
      : ''
  }>`
}

/** describe 内部调用，避免 aria-labelledby 自引用等边界导致异常 */
function getAccessibleNameSafe(el: Element) {
  try {
    return getAccessibleName(el)
  }
  catch {
    return ''
  }
}

/* ---------------------------------- 常量 ---------------------------------- */

const PATTERN_CONTAINER_ROLES: Record<AriaPattern, string[]> = {
  tabs: ['tablist'],
  listbox: ['listbox'],
  combobox: ['combobox'],
  menu: ['menu', 'menubar'],
  dialog: ['dialog', 'alertdialog'],
  grid: ['grid', 'treegrid'],
}

const PATTERN_CHECKERS: Record<AriaPattern, (container: Element, options: AriaPatternOptions, violations: string[]) => void> = {
  tabs: checkTabs,
  listbox: checkListbox,
  combobox: checkCombobox,
  menu: checkMenu,
  dialog: checkDialog,
  grid: checkGrid,
}

const IDREF_ATTRS = ['aria-controls', 'aria-labelledby', 'aria-describedby', 'aria-activedescendant', 'aria-owns']

const MENU_ITEM_ROLES = ['menuitem', 'menuitemcheckbox', 'menuitemradio']
const GRID_CELL_ROLES = ['gridcell', 'columnheader', 'rowheader']
const COMBOBOX_POPUP_ROLES = ['listbox', 'grid', 'tree', 'dialog']

/** 依据 WAI-ARIA 1.2 各状态属性的 Used in Roles（含继承） */
const STATE_ALLOWED_ROLES: Record<string, string[]> = {
  'aria-selected': ['tab', 'option', 'gridcell', 'row', 'columnheader', 'rowheader', 'treeitem'],
  'aria-checked': ['checkbox', 'radio', 'switch', 'menuitemcheckbox', 'menuitemradio', 'option', 'treeitem'],
  'aria-expanded': [
    'application',
    'button',
    'checkbox',
    'combobox',
    'gridcell',
    'link',
    'listbox',
    'menuitem',
    'menuitemcheckbox',
    'menuitemradio',
    'row',
    'rowheader',
    'columnheader',
    'switch',
    'tab',
    'treeitem',
  ],
  'aria-pressed': ['button'],
}

const NAME_FROM_CONTENT_ROLES = new Set([
  'button',
  'cell',
  'checkbox',
  'columnheader',
  'gridcell',
  'heading',
  'link',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'radio',
  'row',
  'rowheader',
  'switch',
  'tab',
  'tooltip',
  'treeitem',
])

const INTERACTIVE_ROLES = new Set([
  'button',
  'checkbox',
  'combobox',
  'link',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'radio',
  'switch',
  'tab',
  'textbox',
])

/* ---------------------------------- 类型 ---------------------------------- */

/** 支持检查的 WAI-ARIA 复合组件模式 */
export type AriaPattern = 'tabs' | 'listbox' | 'combobox' | 'menu' | 'dialog' | 'grid'

/** 模式检查选项，未传时按模式取默认值 */
export interface AriaPatternOptions {
  /**
   * 是否要求 roving tabindex（恰好一个子项可 Tab 聚焦）
   * @default tabs / grid 为 true，其余为 false
   */
  roving?: boolean
  /**
   * 容器是否必须有可访问名
   * @default menu 为 false，其余为 true
   */
  requireName?: boolean
  /**
   * dialog 是否按模态检查 aria-modal
   * @default true
   */
  modal?: boolean
  /**
   * listbox 是否允许没有 option（空状态）
   * @default false
   */
  allowEmpty?: boolean
}
