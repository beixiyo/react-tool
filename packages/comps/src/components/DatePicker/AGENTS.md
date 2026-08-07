# DatePicker 模块约定

本目录提供日期、日期范围、月份、年份与时间选择能力。公共 API 从 `index.ts` 导出，调用契约见 `README.md`，交互示例统一维护在 `Test.tsx`

## 组件地图

```text
DatePicker / DateRangePicker / MonthPicker / YearPicker
  ├── useFormField                 # Form 与受控/非受控值入口
  ├── usePickerState               # open 受控模式和 imperative ref
  ├── PickerBase                   # trigger、Portal、定位、outside、Escape、错误信息
  └── Calendar / MonthGrid / YearGrid

DateRangePicker
  ├── useDateRangeSelection        # 范围草稿、活动端点、hover、当前月份
  └── useDateRangePickerSession    # 打开快照、异步确认、取消恢复、过期结果隔离

DateSpanPicker
  ├── useDateSpanSelection         # 单日 / 区间一体的固定点选状态机
  └── useDateRangePickerSession    # 复用打开事务、确认与取消机制

DateTimeSpanPicker
  ├── useDateTimeSpanSelection     # 全天 / 时刻模式及单日 / 区间草稿
  └── useDateRangePickerSession    # 复用打开事务、确认与取消机制

TimePicker
  ├── TimeUnitPopover              # TimeSegmentInput 内部的数字选项浮层
  ├── QuickTimePopover             # 一次选择完整时分
  └── TimeSegmentInput             # 唯一的时、分、秒控件，组合浮层、键盘和滚轮交互
```

## 状态所有权

- `useFormField` 负责 committed value 与 FormContext 接线
- `usePickerState` 是 open 状态的唯一 owner；组件不得再创建第二套 open state
- DateRangePicker 的编辑值是一次打开事务内的 draft，不得直接混入业务校验或持久化策略
- `useDateRangePickerSession` 独占 Confirm/Cancel 生命周期；不要在组件 JSX 中增加 session ref 或 pending effect
- 日历显示月份、活动端点与 hover 预览归 `useDateRangeSelection`
- Todo 等业务的起止联动、合法性和网络请求必须留在调用方

## 必须复用

- 新的 Picker 入口必须使用 `PickerBase`，禁止自行复制 Portal、浮层定位、outside click、Escape 和错误信息
- 单日 / 区间一体的点选规则使用 `DateSpanPicker`；不要向 `DateRangePicker` 追加 Todo 专属状态机
- `DateTimeSpanPickerValue.hasTime` 是全天 / 时刻模式的唯一判断依据；不得根据 Date 是否为 00:00 猜测
- `DateTimeSpanPicker` 的时刻布局由面板底部 Add time 开关控制；单日的截止时刻由开始块旁的 + 添加
- 单值 Picker 的“关闭后确认”使用 `usePickerConfirmOnClose`，不能写依赖 `internalValue` 的关闭 effect
- 小时、分钟、秒统一使用 `TimeSegmentInput`，由其内部复用 `TimeUnitPopover`
- 完整时刻快捷选择使用 `QuickTimePopover`
- `TimeSegmentInput` 负责范围、焦点和瞬时非法态；Todo 等调用方只处理跨字段业务校验。键盘输入、数字浮层和滚轮能力分别通过显式布尔属性关闭，不增加第二套实现
- 年月头部下拉使用 `CalendarHeaderSelect`
- 嵌套 Portal 需要通过 `DATA_DATE_PICKER_IGNORE` 明确声明不触发父 Picker outside cancel

## 公共 API 边界

- 机制放组件库，业务策略由调用方通过 props/callback 决定
- 新增公共参数时放到真正支持它的 Picker 类型，不要默认塞进 `BasePickerProps`
- 参数默认值和归一化必须位于真正消费参数的最低公共边界
- 受控与非受控模式、FormContext、同步/异步回调都必须保持兼容
- Confirm 返回 `false` 或 Promise reject 时保持 DateRangePicker 打开；旧 Promise 不得影响新 session

## 文件职责

- `DatePicker.tsx` 等入口只做接线和组装
- `components/` 只放可独立渲染、单一职责的 UI
- `hooks/` 只放状态和生命周期机制
- `utils/value.ts` 管理值格式、时间保留和相等判断
- `utils.ts` 保持兼容出口；新增纯函数优先进入职责明确的 `utils/` 子文件
- `types.ts` 维护稳定公共契约，内部类型留在 owning 文件底部

## 验证要求

涉及生命周期或公共 API 时，至少验证：

1. 默认值、受控值和 Form 值
2. outside、Escape、Trigger 与 programmatic close
3. 同步 Confirm、异步成功、`false`、reject、pending 取消及 reopen
4. 嵌套 Popover 的真实 `mousedown → click`
5. DatePicker 定向测试、comps TypeScript 和 build

测试必须复现公共行为，不扫描源码或断言实现细节
