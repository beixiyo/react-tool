import type { CreateSharedTransitionOptions, SharedTransitionMorphOptions } from '../types'

export function normalizeMorph(options: CreateSharedTransitionOptions['morph'] = true): MorphConfig | undefined {
  if (options === false) return
  const config: SharedTransitionMorphOptions = options === true
    ? {}
    : options
  return {
    openDuration: config.duration?.open ?? 520,
    closeDuration: config.duration?.close ?? 420,
    easing: config.easing ?? 'cubic-bezier(0.2, 0.85, 0.2, 1)',
    sourceRadius: config.sourceRadius ?? 20,
    targetRadius: config.targetRadius ?? 16,
    background: config.background ?? 'rgb(var(--background))',
  }
}

/** 使用 Provider 隔离的配对名称，不依赖业务 DOM、全局选择器或模块级计数器 */
export function createMorphStyles(name: string, config: MorphConfig): string {
  const { openDuration, closeDuration, easing, sourceRadius, targetRadius, background } = config
  return `
::view-transition-group(.${name}-open),
::view-transition-group(.${name}-close) {
  animation-timing-function: ${easing};
}

::view-transition-group(.${name}-open) { animation-duration: ${openDuration}ms; }
::view-transition-group(.${name}-close) { animation-duration: ${closeDuration}ms; }
::view-transition-image-pair(.${name}-open),
::view-transition-image-pair(.${name}-close) {
  overflow: clip;
  isolation: isolate;
  background: ${background};
  border-radius: ${sourceRadius}px;
  animation: ${name}-round ${openDuration}ms ${easing} both;
}

::view-transition-image-pair(.${name}-close) {
  animation-name: ${name}-round-close;
  animation-duration: ${closeDuration}ms;
}

::view-transition-old(.${name}-open),
::view-transition-new(.${name}-open),
::view-transition-old(.${name}-close),
::view-transition-new(.${name}-close) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  mix-blend-mode: normal;
  animation-timing-function: linear;
  animation-fill-mode: both;
}

::view-transition-old(.${name}-open) {
  animation-name: ${name}-source-out;
  animation-duration: ${openDuration}ms;
}

::view-transition-new(.${name}-open) {
  animation-name: ${name}-target-in;
  animation-duration: ${openDuration}ms;
}

::view-transition-old(.${name}-close) {
  animation-name: ${name}-target-out;
  animation-duration: ${closeDuration}ms;
}

::view-transition-new(.${name}-close) {
  /* 宽高比尚未收敛时不按高度放大来源，避免窄胶囊两端的内容被裁掉 */
  object-fit: contain;
  object-position: center;
  animation-name: ${name}-source-in;
  animation-duration: ${closeDuration}ms;
}

@keyframes ${name}-round {
  from { border-radius: ${sourceRadius}px; }
  to { border-radius: ${targetRadius}px; }
}

/* VT 快照会继承 image-pair 的 animation-direction；收起也保持正向时间轴 */
@keyframes ${name}-round-close {
  from { border-radius: ${targetRadius}px; }
  to { border-radius: ${sourceRadius}px; }
}

@keyframes ${name}-source-out {
  from { opacity: 1; }
  22%, to { opacity: 0; }
}

@keyframes ${name}-target-in {
  from { opacity: 0; }
  22%, to { opacity: 1; }
}

@keyframes ${name}-target-out {
  from { opacity: 1; }
  12%, to { opacity: 0; }
}

@keyframes ${name}-source-in {
  from, 45% { opacity: 0; }
  80%, to { opacity: 1; }
}
`
}

/** 归一化后的内部变形参数 */
export interface MorphConfig {
  openDuration: number
  closeDuration: number
  easing: NonNullable<SharedTransitionMorphOptions['easing']>
  sourceRadius: number
  targetRadius: number
  background: NonNullable<SharedTransitionMorphOptions['background']>
}
