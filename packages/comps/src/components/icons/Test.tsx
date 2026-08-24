import { useState } from 'react'
import { CloseBtn } from '../CloseBtn'
import { GithubSourceLink } from '../GithubSourceLink'
import { PlusBtn } from '../PlusBtn'
import { ThemeToggle } from '../ThemeToggle'
import { Plus } from './Plus'
import { X } from './X'

const sizes = ['sm', 'md', 'lg', 'xl'] as const

function IconSample({
  label,
  children,
}: React.PropsWithChildren<{ label: string }>) {
  return (
    <div className="flex min-w-20 flex-col items-center gap-2 rounded-xl border border-border bg-background px-3 py-4">
      { children }
      <span className="text-xs text-text2">{ label }</span>
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: React.PropsWithChildren<{ title: string; description: string }>) {
  return (
    <section className="rounded-2xl border border-border bg-background2/60 p-5 shadow-xs backdrop-blur-xs">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-text">{ title }</h2>
        <p className="mt-1 text-sm text-text2">{ description }</p>
      </div>
      { children }
    </section>
  )
}

function IconsTest() {
  const [clickCount, setClickCount] = useState(0)

  return (
    <div className="min-h-screen overflow-auto bg-background p-6 text-text">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold tracking-tight">SVG Icons</div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text2">
              集中验证 SVG 与 icon-like 按钮的尺寸、透明描边、基础 SVG 属性、变体和交互行为
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="space-y-5">
          <Section
            title="基础图标"
            description="纯 SVG 图标与 icon button 使用同一组尺寸、定位、颜色与描边配置。"
          >
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
              { sizes.map((size) => (
                <IconSample key={ `close-${size}` } label={ `Close ${size}` }>
                  <CloseBtn mode="static" size={ size } />
                </IconSample>
              )) }
              { sizes.map((size) => (
                <IconSample key={ `plus-${size}` } label={ `Plus ${size}` }>
                  <PlusBtn mode="static" size={ size } />
                </IconSample>
              )) }
            </div>
          </Section>

          <Section
            title="纯 SVG 与自定义内容"
            description="X 与 Plus 可独立使用；CloseBtn 的 children 会替换默认 X 图标。"
          >
            <div className="flex flex-wrap items-center gap-4">
              <IconSample label="X SVG">
                <X size="lg" className="text-text" strokeWidth={ 2.5 } />
              </IconSample>
              <IconSample label="Plus SVG">
                <Plus size={ 24 } className="text-text" strokeWidth={ 2.5 } />
              </IconSample>
              <IconSample label="Close custom child">
                <CloseBtn mode="static" size="lg">
                  <Plus size="md" strokeWidth={ 2.5 } />
                </CloseBtn>
              </IconSample>
            </div>
          </Section>

          <Section
            title="半透明描边"
            description="交点使用单次 path stroke 绘制，检查中心是否出现 alpha 重叠。"
          >
            <div className="flex flex-wrap items-center gap-4">
              <IconSample label="Close alpha 50%">
                <CloseBtn mode="static" size="xl" iconProps={ { stroke: 'rgb(59 130 246 / 0.5)' } } />
              </IconSample>
              <IconSample label="Plus alpha 50%">
                <PlusBtn mode="static" size="xl" iconProps={ { stroke: 'rgb(59 130 246 / 0.5)' } } />
              </IconSample>
              <IconSample label="Close alpha 25%">
                <CloseBtn mode="static" size="xl" iconProps={ { stroke: 'rgb(236 72 153 / 0.25)' } } />
              </IconSample>
              <IconSample label="Plus alpha 25%">
                <PlusBtn mode="static" size="xl" iconProps={ { stroke: 'rgb(236 72 153 / 0.25)' } } />
              </IconSample>
            </div>
          </Section>

          <Section
            title="描边参数"
            description="验证 strokeWidth、strokeLinecap、strokeLinejoin 和 vectorEffect。"
          >
            <div className="flex flex-wrap items-end gap-4">
              <IconSample label="1px">
                <PlusBtn mode="static" size="xl" strokeWidth={ 1 } />
              </IconSample>
              <IconSample label="2.5px">
                <PlusBtn mode="static" size="xl" strokeWidth={ 2.5 } />
              </IconSample>
              <IconSample label="5px square">
                <PlusBtn
                  mode="static"
                  size="xl"
                  strokeWidth={ 5 }
                  iconProps={ { strokeLinecap: 'square' } }
                />
              </IconSample>
              <IconSample label="bevel">
                <CloseBtn
                  mode="static"
                  size="xl"
                  iconProps={ {
                    strokeLinecap: 'square',
                    strokeLinejoin: 'bevel',
                    vectorEffect: 'non-scaling-stroke',
                  } }
                />
              </IconSample>
            </div>
          </Section>

          <Section
            title="外观属性"
            description="验证 fill、opacity、className、style 和 filled 变体。"
          >
            <div className="flex flex-wrap items-center gap-4">
              <CloseBtn mode="static" variant="filled" size="lg" />
              <PlusBtn mode="static" variant="filled" size="lg" />
              <CloseBtn
                mode="static"
                size="lg"
                iconProps={ {
                  opacity: 0.45,
                  stroke: 'rgb(16 185 129)',
                  style: { transform: 'rotate(8deg)' },
                } }
              />
              <PlusBtn
                mode="static"
                size="lg"
                iconProps={ {
                  opacity: 0.45,
                  stroke: 'rgb(245 158 11)',
                  className: 'scale-110',
                } }
              />
            </div>
          </Section>

          <Section
            title="交互与无障碍"
            description="验证原生 button 行为、aria-label、事件回调和冒泡控制。"
          >
            <div className="flex flex-wrap items-center gap-4">
              <PlusBtn
                mode="static"
                variant="filled"
                size="lg"
                aria-label="增加计数"
                onClick={ () => setClickCount((count) => count + 1) }
              />
              <CloseBtn
                mode="static"
                size="lg"
                aria-label="重置计数"
                onClick={ () => setClickCount(0) }
              />
              <span className="rounded-lg bg-background px-3 py-2 text-sm text-text2">
                当前计数：<span className="font-medium text-text">{ clickCount }</span>
              </span>
            </div>
          </Section>
        </div>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default IconsTest
