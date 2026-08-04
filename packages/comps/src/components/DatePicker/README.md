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

- `hasTime: false`：全天模式，只显示日历、Add time 与 Confirm
- Add time：无日期时自动选今天；单日添加一个开始时刻；日期段添加独立 Start / End 时刻
- 单日开始块旁的 `+` 才会添加结束时刻，默认开始后 15 分钟且不跨日
- Clear time 只移除时刻，保留当前单日或日期段
- `syncEndTimeWithStart` 默认关闭；开启后，只要同时存在 Start / End，改 Start 就会保持原完整时长平移 End（允许自然跨日）
- `enableTimeInputWheel` 默认开启；配合 `timeInputMode="segments"` 时，聚焦并将鼠标置于时、分、秒输入框上可滚轮调整当前字段，并阻止外层页面滚动；传入 `false` 可关闭

### 图标

时刻区的图标均可单独替换：`timeIcon`（快捷时刻）、`addTimeIcon`（Add time）、`addEndTimeIcon`（添加结束时刻）和 `clearTimeIcon`（清除时刻）。未传时分别使用时钟、时钟、加号和垃圾桶图标。
