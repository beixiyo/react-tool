'use client'

/**
 * API 属性表渲染
 *
 * 把 genComponentProps 生成的 TypeDoc 数据渲染为表格或签名展示
 */
import type { ComponentPropsDoc } from '@/generated/componentProps'
import { memo } from 'react'
import { cn } from 'utils'

type TypeDoc = ComponentPropsDoc['types'][number]

/**
 * 单个类型的 API 展示区块
 *
 * interface / 对象字面量别名渲染为属性表格，其余别名渲染为签名单行代码
 */
export const PropsSection = memo<{ type: TypeDoc; primary?: boolean }>(({
  type,
  primary = false,
}) => {
  return (
    <section className="mb-8 last:mb-0">
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-mono text-base font-semibold text-text">
          { primary && <span className="mr-1.5 text-systemOrange">*</span> }
          { type.name }
        </h3>
        <span className="rounded bg-background2 px-1.5 py-0.5 text-xs text-text2">
          { type.kind === 'interface'
            ? 'interface'
            : 'type' }
        </span>
        { type.extends && (
          <span className="truncate font-mono text-xs text-text2">
            extends&nbsp;{ type.extends.join(' & ') }
          </span>
        ) }
      </div>

      { type.description && <p className="mb-3 text-sm leading-relaxed text-text2">{ type.description }</p> }

      { type.props && type.props.length > 0
        ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-background2 text-left text-xs text-text2">
                  <th className="px-4 py-2.5 font-medium">属性</th>
                  <th className="px-4 py-2.5 font-medium">类型</th>
                  <th className="px-4 py-2.5 font-medium">默认值</th>
                  <th className="px-4 py-2.5 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                { type.props.map((prop) => (
                  <tr
                    key={ prop.name }
                    className="border-b border-border/60 last:border-b-0"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5 align-top">
                      <code
                        className={ cn(
                          'font-mono text-[13px]',
                          prop.deprecated
                            ? 'text-text2 line-through'
                            : 'text-text',
                        ) }
                      >
                        { prop.name }
                      </code>
                      { !prop.optional && <span className="ml-1 text-systemOrange" title="必填">*</span> }
                    </td>
                    <td className="px-4 py-2.5 align-top">
                      <code className="break-all font-mono text-xs leading-relaxed text-text2">
                        { prop.type }
                      </code>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 align-top">
                      { prop.default
                        ? (
                          <code className="font-mono text-xs text-text2">
                            { prop.default }
                          </code>
                        )
                        : <span className="text-text2/60">—</span> }
                    </td>
                    <td className="px-4 py-2.5 align-top text-[13px] leading-relaxed">
                      { prop.deprecated && (
                        <span className="mr-1.5 rounded bg-systemOrange/15 px-1.5 py-0.5 text-xs text-systemOrange">
                          已废弃
                        </span>
                      ) }
                      { prop.description ?? '' }
                    </td>
                  </tr>
                )) }
              </tbody>
            </table>
          </div>
        )
        : type.signature && (
          <pre className="overflow-x-auto rounded-lg border border-border bg-background2 p-4 font-mono text-xs leading-relaxed text-text2">
            { type.signature }
          </pre>
        ) }
    </section>
  )
})
