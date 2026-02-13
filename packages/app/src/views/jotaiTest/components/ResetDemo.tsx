import { Button, Card, Input } from 'comps'
import { atomWithReset } from 'jotai/utils'
import { memo } from 'react'
import { createUseAtoms } from '../jotaiTool'

/**
 * useReset 功能演示组件
 */

const resetAtoms = {
  count: atomWithReset(0),
  name: atomWithReset('Initial Name'),
  isActive: atomWithReset(false),
  _private: atomWithReset('private'), // 这个应该被过滤
}

const { useAtoms: useResetAtoms, useReset } = createUseAtoms(resetAtoms)

export const ResetDemo = memo(() => {
  const atoms = useResetAtoms()
  const resetAll = useReset()
  const resetCount = useReset(['count'])
  const resetName = useReset(['name'])
  const resetMultiple = useReset(['count', 'name'])

  return (
    <Card
      title="useReset 功能演示"
      variant="default"
      bordered
      shadow="md"
      padding="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text2 mb-2">
              Count
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={ String(atoms.count ?? 0) }
                readOnly
                className="flex-1"
              />
              <Button
                onClick={ () => {
                  if (typeof atoms.setCount === 'function') {
                    atoms.setCount((atoms.count ?? 0) + 1)
                  }
                } }
                variant="primary"
                size="md"
              >
                +1
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text2 mb-2">
              Name
            </label>
            <Input
              value={ atoms.name ?? '' }
              onChange={ (value) => {
                atoms.name = value
              } }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text2 mb-2">
              Is Active
            </label>
            <Button
              onClick={ () => {
                atoms.isActive = !atoms.isActive
              } }
              variant={ atoms.isActive
                ? 'success'
                : 'default' }
              block
            >
              { atoms.isActive
                ? 'Active'
                : 'Inactive' }
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button
              onClick={ () => resetAll() }
              variant="primary"
              block
            >
              重置所有
            </Button>
            <Button
              onClick={ () => resetCount() }
              variant="default"
              block
            >
              重置 Count
            </Button>
            <Button
              onClick={ () => resetName() }
              variant="default"
              block
            >
              重置 Name
            </Button>
            <Button
              onClick={ () => resetMultiple() }
              variant="default"
              block
            >
              重置 Count & Name
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
})

ResetDemo.displayName = 'ResetDemo'
