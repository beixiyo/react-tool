# DatePicker

## DateTimeSpanPicker

`DateTimeSpanPicker` 适合 Todo 这类先选日期、再按需添加时刻的场景：

```tsx
const [value, setValue] = useState<DateTimeSpanPickerValue>({
  start: null,
  end: null,
  hasTime: false,
})

<DateTimeSpanPicker value={ value } onChange={ setValue } precision="minute" />
```

- `hasTime: false`：全天模式，只显示日历、Add time 开关与 Confirm
- Add time 开关：无日期时自动选今天；单日添加一个开始时刻；日期段添加独立 Start / End 时刻；关闭时移除时刻但保留日期
- 单日开始块旁的 `+` 才会添加结束时刻，默认开始后 15 分钟且不跨日
- `syncEndTimeWithStart` 默认关闭；开启后，只要同时存在 Start / End，改 Start 就会保持原完整时长平移 End（允许自然跨日）
- 时、分、秒统一由分段控件处理：默认同时支持键盘输入和数字浮层；`enableTimeKeyboardInput`、`enableTimeUnitPopover` 可分别关闭，两者可组合成双交互、仅输入、仅面板或只读展示
- 数字浮层支持 `Escape` 和 `Enter` 关闭；`precision="hour" | "minute" | "second"` 分别控制精确到时、分或秒
- `enableTimeInputWheel` 默认开启；聚焦并将鼠标置于时、分、秒输入框上可滚轮调整当前字段，并阻止外层页面滚动；传入 `false` 可关闭

### 图标

时刻区使用品牌色 `Switch` 切换全天 / 计时模式；`timeIcon` 可替换快捷时刻图标，`addEndTimeIcon` 可替换添加结束时刻图标。
