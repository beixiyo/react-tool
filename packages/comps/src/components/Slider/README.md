# Slider 组件

一个功能完整、性能优化的滑块组件，支持单滑块、双滑块、垂直方向、刻度标记等多种模式。

## 🚀 特性

### 基础功能
- ✅ 单滑块和双滑块模式（range）
- ✅ 水平和垂直方向
- ✅ 最小值、最大值、步长设置
- ✅ 禁用状态
- ✅ 反向坐标轴

### 高级功能
- ✅ 刻度标记（marks）
- ✅ 键盘操作支持
- ✅ 只能拖拽到刻度点（dots）
- ✅ 智能 Tooltip 显示
- ✅ 完整的无障碍支持

### 性能优化
- ✅ **零延迟拖拽**：拖拽时自动禁用过渡动画，确保实时响应
- ✅ **智能 Tooltip**：独立组件，支持边界检测和自适应定位
- ✅ **响应式设计**：支持各种屏幕尺寸和设备

### 样式自定义
- ✅ **完全可定制**：支持自定义滑块手柄、轨道、进度条、刻度标记的所有样式
- ✅ **主题支持**：内置多种主题配置，支持深色/浅色模式
- ✅ **灵活配置**：通过 styleConfig 属性轻松定制组件外观

## 📦 组件结构

```
src/components/
├── Slider/
│   ├── index.tsx          # 主组件
│   ├── SliderTest.tsx     # 测试页面
│   └── README.md          # 文档
└── Tooltip/
    ├── index.tsx          # Tooltip 组件
    └── TooltipTest.tsx    # Tooltip 测试页面
```

## 🎯 API 参考

### SliderProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `disabled` | `boolean` | `false` | 值为 true 时，滑块为禁用状态 |
| `keyboard` | `boolean` | `true` | 支持使用键盘操作 handler |
| `dots` | `boolean` | `false` | 是否只能拖拽到刻度上 |
| `included` | `boolean` | `true` | marks 不为空对象时有效，值为 true 时表示值为包含关系 |
| `marks` | `Record<number, React.ReactNode \| MarkConfig>` | - | 刻度标记 |
| `max` | `number` | `100` | 最大值 |
| `min` | `number` | `0` | 最小值 |
| `range` | `boolean` | `false` | 双滑块模式 |
| `reverse` | `boolean` | `false` | 反向坐标轴 |
| `step` | `number \| null` | `1` | 步长 |
| `tooltip` | `boolean \| TooltipConfig` | - | 设置 Tooltip 相关属性 |
| `value` | `number \| [number, number]` | - | 设置当前取值 |
| `vertical` | `boolean` | `false` | 值为 true 时，Slider 为垂直方向 |
| `onChange` | `(value) => void` | - | 当 Slider 的值发生改变时触发 |
| `onChangeComplete` | `(value) => void` | - | 与 mouseup 和 keyup 触发时机一致 |
| `styleConfig` | `SliderStyleConfig` | - | 样式配置 |

### TooltipConfig

| 属性 | 类型 | 说明 |
|------|------|------|
| `formatter` | `(value: number) => React.ReactNode` | 自定义格式化函数 |

### MarkConfig

| 属性 | 类型 | 说明 |
|------|------|------|
| `label` | `React.ReactNode` | 标签内容 |
| `style` | `React.CSSProperties` | 自定义样式 |

### SliderStyleConfig

| 属性 | 类型 | 说明 |
|------|------|------|
| `handle` | `HandleStyleConfig` | 滑块手柄样式配置 |
| `track` | `TrackStyleConfig` | 轨道样式配置 |
| `fill` | `FillStyleConfig` | 进度条样式配置 |
| `marks` | `MarksStyleConfig` | 刻度标记样式配置 |

#### HandleStyleConfig

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | `string` | `'w-5 h-5'` | 手柄大小 |
| `color` | `string` | `'bg-white border-blue-500'` | 手柄颜色 |
| `border` | `string` | `'border-2'` | 手柄边框 |
| `rounded-xs` | `string` | `'rounded-full'` | 手柄圆角 |
| `hover` | `string` | `'hover:scale-110'` | 悬停效果 |
| `focus` | `string` | `'focus:scale-110 focus:ring-2 focus:ring-blue-500'` | 焦点效果 |

#### TrackStyleConfig

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `background` | `string` | `'bg-gray-200'` | 轨道背景颜色 |
| `size` | `string` | `'h-1'` / `'w-1'` | 轨道高度/宽度 |
| `rounded-xs` | `string` | `'rounded-full'` | 轨道圆角 |

#### FillStyleConfig

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `color` | `string` | `'bg-blue-500'` | 进度条颜色 |
| `rounded-xs` | `string` | `'rounded-full'` | 进度条圆角 |

#### MarksStyleConfig

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `dotColor` | `string` | `'bg-white border-gray-300'` | 刻度点颜色 |
| `activeDotColor` | `string` | `'bg-blue-500 border-blue-500'` | 激活状态刻度点颜色 |
| `labelColor` | `string` | `'text-gray-600'` | 标签文字颜色 |

## 🎮 键盘操作

| 按键 | 功能 |
|------|------|
| `←` / `↓` | 减少值 |
| `→` / `↑` | 增加值 |
| `Home` | 跳转到最小值 |
| `End` | 跳转到最大值 |
| `Page Up` | 大幅度增加（10倍步长） |
| `Page Down` | 大幅度减少（10倍步长） |
| `Tab` | 在多个滑块间切换焦点 |

## 💡 使用示例

### 基础滑块

```tsx
function BasicSlider() {
  const [value, setValue] = useState(30)

  return (
    <Slider
      value={ value }
      onChange={ setValue }
      tooltip={ { formatter: val => `${val}%` } }
    />
  )
}
```

### 双滑块（范围选择）

```tsx
function RangeSlider() {
  const [value, setValue] = useState<[number, number]>([20, 60])

  return (
    <Slider
      range
      value={ value }
      onChange={ setValue }
      tooltip={ { formatter: val => `${val}%` } }
    />
  )
}
```

### 带刻度标记

```tsx
function MarkedSlider() {
  const marks = {
    0: '0°C',
    26: '26°C',
    37: '37°C',
    100: {
      style: { color: '#f50' },
      label: <strong>100°C</strong>,
    },
  }

  return (
    <Slider
      marks={ marks }
      step={ null }
      tooltip={ { formatter: val => `${val}°C` } }
    />
  )
}
```

### 垂直滑块

```tsx
function VerticalSlider() {
  return (
    <div className="h-48">
      <Slider
        vertical
        tooltip={ { formatter: val => `${val}%` } }
      />
    </div>
  )
}
```

### 样式自定义

```tsx
function CustomStyledSlider() {
  return (
    <Slider
      tooltip={ { formatter: val => `${val}%` } }
      styleConfig={ {
        handle: {
          size: 'w-6 h-6',
          color: 'bg-white border-green-500',
          focus: 'focus:ring-2 focus:ring-green-500',
        },
        track: {
          background: 'bg-green-100',
          size: 'h-2',
        },
        fill: {
          color: 'bg-green-500',
        },
        marks: {
          activeDotColor: 'bg-green-500 border-green-500',
          labelColor: 'text-green-600',
        },
      } }
    />
  )
}
```
