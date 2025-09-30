import { memo, useCallback } from 'react'
import { cn } from 'utils'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Switch } from '@/components/Switch'
import { DISCUSSION_ROUND_OPTIONS, SCHEME_COUNT_OPTIONS } from '../../constants'
import type { SessionConfig } from '../../types'

type ConfigPanelProps = {
  config: SessionConfig
  loading?: boolean
  onChange?: (config: SessionConfig) => void
}

export const ConfigPanel = memo<ConfigPanelProps>((props) => {
  const { config, loading = false, onChange } = props

  const handleUpdate = useCallback((payload: Partial<SessionConfig>) => {
    onChange?.({
      ...config,
      ...payload,
    })
  }, [config, onChange])

  return (
    <div className="grid gap-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-6 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="grid gap-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">协作配置</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">根据场景调整讨论轮次与方案数量，后续支持更多自定义选项。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ConfigField
          label="讨论轮数"
          description="AI 团队内部讨论的次数"
        >
          <OptionSelector
            options={ DISCUSSION_ROUND_OPTIONS }
            value={ config.discussionRounds }
            disabled={ loading }
            onSelect={ (value) => {
              handleUpdate({ discussionRounds: value })
            } }
          />
        </ConfigField>

        <ConfigField
          label="方案数量"
          description="需要生成的备选方案个数"
        >
          <OptionSelector
            options={ SCHEME_COUNT_OPTIONS }
            value={ config.schemeCount }
            disabled={ loading }
            onSelect={ (value) => {
              handleUpdate({ schemeCount: value })
            } }
          />
        </ConfigField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ConfigField
          label="使用上下文"
          description="后续可选择历史协作作为上下文参考"
        >
          <Switch
            checked={ config.contextSessionIds.length > 0 }
            disabled
            onCheckedChange={ () => { } }
          />
        </ConfigField>

        <ConfigField
          label="预估预算"
          description="未来将扩展预算和资源配置"
        >
          <Input
            value="待配置"
            readOnly
            disabled
          />
        </ConfigField>
      </div>

      <div className="flex flex-col items-start gap-3 rounded-2xl bg-slate-900/5 p-4 text-sm text-slate-600 dark:bg-slate-100/5 dark:text-slate-300 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium">高级选项即将开放</p>
          <p>包括多 Agent 协作、实时进度、上下文压缩策略等能力。</p>
        </div>
        <Button
          disabled
          variant="default"
          designStyle="flat"
          className="rounded-full bg-slate-900 px-4 py-2 text-white dark:bg-slate-100 dark:text-slate-900"
        >
          敬请期待
        </Button>
      </div>
    </div>
  )
})

ConfigPanel.displayName = 'ConfigPanel'

type ConfigFieldProps = {
  label: string
  description?: string
  children: React.ReactNode
}

function ConfigField(props: ConfigFieldProps) {
  const { label, description, children } = props
  return (
    <label className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-slate-950/50">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{ label }</p>
        { description && <p className="text-xs text-slate-500 dark:text-slate-400">{ description }</p> }
      </div>
      { children }
    </label>
  )
}

type OptionSelectorProps = {
  options: readonly number[]
  value: number
  disabled?: boolean
  onSelect?: (value: number) => void
}

function OptionSelector(props: OptionSelectorProps) {
  const { options, value, disabled = false, onSelect } = props

  return (
    <div className="flex flex-wrap gap-2">
      { options.map(item => (
        <button
          key={ item }
          className={ cn(
            'min-w-16 rounded-full border px-3 py-1 text-sm transition',
            'border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-100 dark:hover:text-slate-100',
            item === value && 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900',
            disabled && 'cursor-not-allowed opacity-50',
          ) }
          onClick={ () => onSelect?.(item) }
          disabled={ disabled }
          type="button"
        >
          { item }
        </button>
      )) }
    </div>
  )
}


