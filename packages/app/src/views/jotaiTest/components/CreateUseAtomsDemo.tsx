import { Button, Card, Input } from 'comps'
import { atom } from 'jotai'
import { memo, useState } from 'react'
import { cn } from 'utils'
import { createUseAtoms } from '../jotaiTool'

/**
 * createUseAtoms 功能演示组件
 */

const demoAtoms = {
  count: atom(0),
  name: atom('Jotai'),
  isActive: atom(false),
  _private: atom('private'), // 这个应该被过滤
}

const { useAtoms: useDemoAtoms } = createUseAtoms(demoAtoms)

export const CreateUseAtomsDemo = memo(() => {
  const atoms = useDemoAtoms()
  const [testResults, setTestResults] = useState<string[]>([])

  const runTests = () => {
    const results: string[] = []

    /** 测试 1: 读取值 */
    try {
      const count = atoms.count
      const name = atoms.name
      const isActive = atoms.isActive
      results.push(`✅ 读取值: count=${count}, name=${name}, isActive=${isActive}`)
    }
    catch (error) {
      results.push(`❌ 读取值失败: ${error}`)
    }

    /** 测试 2: 检查私有属性是否被过滤 */
    try {
      const hasPrivate = '_private' in atoms
      results.push(hasPrivate
        ? '❌ 私有属性未被过滤'
        : '✅ 私有属性已过滤')
    }
    catch (error) {
      results.push(`✅ 私有属性已过滤（访问错误）`)
    }

    /** 测试 3: 使用 setter 方法 */
    try {
      if (typeof atoms.setCount === 'function') {
        atoms.setCount(10)
        results.push(`✅ setCount 方法存在`)
      }
      else {
        results.push(`❌ setCount 方法不存在`)
      }
    }
    catch (error) {
      results.push(`❌ setCount 调用失败: ${error}`)
    }

    /** 测试 4: 使用属性赋值 */
    try {
      atoms.name = 'Updated'
      results.push(`✅ 属性赋值成功`)
    }
    catch (error) {
      results.push(`❌ 属性赋值失败: ${error}`)
    }

    /** 测试 5: 检查所有 keys */
    try {
      const keys = Object.keys(atoms)
      results.push(`✅ 可访问的 keys: ${keys.join(', ')}`)
    }
    catch (error) {
      results.push(`❌ 获取 keys 失败: ${error}`)
    }

    setTestResults(results)
  }

  return (
    <Card
      title="createUseAtoms 功能演示"
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
              {atoms.isActive
                ? 'Active'
                : 'Inactive'}
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Button
            onClick={ runTests }
            variant="primary"
            block
          >
            运行功能测试
          </Button>

          {testResults.length > 0 && (
            <div className="mt-4 space-y-1">
              {testResults.map((result, index) => (
                <div
                  key={ index }
                  className={ cn(
                    'text-sm p-2 rounded',
                    result.startsWith('✅')
                      ? 'bg-success/10 text-success'
                      : 'bg-danger/10 text-danger',
                  ) }
                >
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
})

CreateUseAtomsDemo.displayName = 'CreateUseAtomsDemo'
