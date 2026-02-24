import { Card } from 'comps'
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'

export type TestResultProps = {
  total: number
  passed: number
  failed: number
  duration: number
  className?: string
}

export const TestResult = memo<TestResultProps>((props) => {
  const {
    total,
    passed,
    failed,
    duration,
    className,
  } = props

  const successRate = total > 0
    ? (passed / total) * 100
    : 0

  return (
    <Card
      className={ cn('', className) }
      variant="default"
      bordered
      shadow="md"
      padding="lg"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">
            测试结果
          </h2>
          <div className="text-sm text-text2">
            总耗时:
            { ' ' }
            { duration }
            ms
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-text">
              { total }
            </div>
            <div className="text-sm text-text2 mt-1">
              总计
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success flex items-center justify-center gap-1">
              <CheckCircle2 className="w-5 h-5" />
              { passed }
            </div>
            <div className="text-sm text-text2 mt-1">
              通过
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-danger flex items-center justify-center gap-1">
              <XCircle className="w-5 h-5" />
              { failed }
            </div>
            <div className="text-sm text-text2 mt-1">
              失败
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text2">通过率</span>
            <span className="text-sm font-medium text-text">
              { successRate.toFixed(1) }
              %
            </span>
          </div>
          <div className="w-full h-2 bg-background2 rounded-full overflow-hidden">
            <div
              className={ cn(
                'h-full transition-all duration-500',
                successRate === 100
                  ? 'bg-success'
                  : successRate >= 80
                    ? 'bg-warning'
                    : 'bg-danger',
              ) }
              style={ { width: `${successRate}%` } }
            />
          </div>
        </div>

        { failed > 0 && (
          <div className="pt-2 flex items-start gap-2 text-sm text-warning bg-warning/10 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              有
              { ' ' }
              { failed }
              { ' ' }
              个测试失败，请检查上面的测试详情。
            </div>
          </div>
        ) }
      </div>
    </Card>
  )
})

TestResult.displayName = 'TestResult'
