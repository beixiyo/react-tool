import { useNotifyParentReady } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle } from './Card'

export default function () {
  useNotifyParentReady()

  const operations: CanvasItem[] = [
    {
      name: 'source-over',
      description: '默认值。在现有内容上方绘制新内容。',
    },
    {
      name: 'source-in',
      description: '仅显示新内容和现有内容重叠的部分，其他区域变透明。',
    },
    {
      name: 'source-out',
      description: '仅显示新内容中与现有内容不重叠的部分。',
    },
    {
      name: 'source-atop',
      description: '显示新内容中与现有内容重叠的部分，保持现有内容的透明区域。',
    },
    {
      name: 'destination-over',
      description: '在现有内容下方绘制新内容。',
    },
    {
      name: 'destination-in',
      description: '仅保留现有内容中与新内容重叠的部分，其他区域变透明。',
    },
    {
      name: 'destination-out',
      description: '删除现有内容中与新内容重叠的部分。',
    },
    {
      name: 'destination-atop',
      description: '保留现有内容中与新内容重叠的部分，显示所有新内容。',
    },
    {
      name: 'lighter',
      description: '重叠区域的颜色值相加。',
    },
    {
      name: 'copy',
      description: '只显示新内容，完全忽略现有内容。',
    },
    {
      name: 'xor',
      description: '重叠区域变透明，其他区域正常显示。',
    },
    {
      name: 'multiply',
      description: '将新内容和现有内容的颜色值相乘。',
    },
    {
      name: 'screen',
      description: '与multiply相反，颜色值反相后相乘，再反相。',
    },
    {
      name: 'overlay',
      description: '根据现有内容的颜色决定是multiply还是screen。',
    },
    {
      name: 'darken',
      description: '保留重叠区域中较深的颜色。',
    },
    {
      name: 'lighten',
      description: '保留重叠区域中较亮的颜色。',
    },
  ]

  const drawExample = (canvas: HTMLCanvasElement, operation: GlobalCompositeOperation) => {
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    /** 绘制底层红色圆形 */
    ctx.fillStyle = 'rgba(255, 0, 0, 0.7)'
    ctx.beginPath()
    ctx.arc(30, 30, 25, 0, Math.PI * 2)
    ctx.fill()

    /** 设置合成模式 */
    ctx.globalCompositeOperation = operation

    /** 绘制上层蓝色圆形 */
    ctx.fillStyle = 'rgba(0, 0, 255, 0.7)'
    ctx.beginPath()
    ctx.arc(50, 30, 25, 0, Math.PI * 2)
    ctx.fill()

    /** 重置合成模式 */
    ctx.globalCompositeOperation = 'source-over'
  }

  useEffect(() => {
    operations.forEach((op) => {
      const canvas = document.getElementById(`canvas-${op.name}`) as HTMLCanvasElement
      if (canvas) {
        drawExample(canvas, op.name)
      }
    })
  }, [])

  return (
    <Card className="h-full w-full overflow-auto">
      <CardHeader>
        <CardTitle>Canvas 合成模式示例</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:grid-cols-2">
          {operations.map(op => (
            <div key={ op.name } className="border rounded p-4">
              <canvas
                id={ `canvas-${op.name}` }
                width="80"
                height="60"
                className="mb-2 bg-gray-50"
              />
              <div>
                <strong className="text-sm">{op.name}</strong>
                <p className="text-sm text-gray-600">{op.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface CanvasItem {
  name: GlobalCompositeOperation
  description: string
}
