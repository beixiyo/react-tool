# DatePicker

## DateTimeSpanPicker

`DateTimeSpanPicker` 适合 Todo 这类先选日期、再按需添加时刻的场景：

```tsx
const [value, setValue] = useState<DateTimeSpanPickerValue>({
  start: null,
  end: null,
  hasTime: false,
})

<DateTimeSpanPicker
  value={ value }
  onChange={ setValue }
  precision="minute"
  defaultEndTimeOffsetMinutes={ 15 }
/>
```

- `hasTime: false`：全天模式，只显示日历、Add time 开关与 Confirm
- Add time 开关：无日期时自动选今天；单日添加一个开始时刻；日期段添加独立 Start / End 时刻；关闭时移除时刻但保留日期
- `defaultEndTimeOffsetMinutes` 统一配置跨日开启 Add time 和单日点击 `+` 时的默认 End 偏移；未传时沿用 `minuteStep`
- 单日开始块旁的 `+` 才会添加结束时刻，生成结果不会跨日
- `syncEndTimeWithStart` 默认关闭；开启后，只要同时存在 Start / End，改 Start 就会保持原完整时长平移 End（允许自然跨日）
- 时、分、秒统一由分段控件处理：默认同时支持键盘输入和数字浮层；`enableTimeKeyboardInput`、`enableTimeUnitPopover` 可分别关闭，两者可组合成双交互、仅输入、仅面板或只读展示
- 数字浮层支持 `Escape` 和 `Enter` 关闭；`precision="hour" | "minute" | "second"` 分别控制精确到时、分或秒
- 数字浮层默认使用平滑滚动定位已选项；`enableTimeUnitScrollAnimation={false}` 可保留自动定位但关闭动画
- 年月下拉默认使用平滑滚动定位当前选项；`enableHeaderScrollAnimation={false}` 可保留自动定位但关闭动画
- `enableTimeInputWheel` 默认开启；聚焦并将鼠标置于时、分、秒输入框上可滚轮调整当前字段，并阻止外层页面滚动；传入 `false` 可关闭
- `enableRangeHoverPreview` 默认开启；传入 `false` 会关闭范围选择中随鼠标更新的临时区间背景
- `rangeFormatter` 可自定义日期范围最终展示文本；回调可读取开始 / 结束端点默认文本、分隔符、同日 / 同年状态和基础格式选项

### 业务校验

`DateRangePicker`、`DateSpanPicker` 和 `DateTimeSpanPicker` 的 `onConfirm` 可以返回校验失败结果。失败后选择器保持打开，并在触发器下方展示 `message`：

```tsx
<DateTimeSpanPicker
  value={ value }
  onChange={ setValue }
  onConfirm={ (nextValue) => {
    if (!isValidBusinessDate(nextValue)) {
      return {
        valid: false,
        message: '结束时间不符合业务规则',
      }
    }
  } }
/>
```

`message` 支持 `ReactNode`。原有的 `false` 返回值仍然可以拒绝确认，但不会自动展示错误内容；`error` 和 `errorMessage` 继续用于 Form 或外部受控错误。

若业务需要把草稿校验直接标记在面板内的 Start / End 时刻字段，可传入 `getTimeFieldErrors`。该回调只提供字段错误状态，不替调用方决定 Confirm 是否允许提交：

```tsx
<DateTimeSpanPicker
  value={ value }
  onChange={ setValue }
  getTimeFieldErrors={ (draft) => ({
    start: draft.start ? isBeforeNow(draft.start) : false,
    end: draft.end ? isBeforeNow(draft.end) : false,
  }) }
  onConfirm={ (draft) => isValidBusinessDate(draft) || { valid: false }}
/>
```

### 图标

时刻区使用品牌色 `Switch` 切换全天 / 计时模式；`timeIcon` 可替换快捷时刻图标，`addEndTimeIcon` 可替换添加结束时刻图标。
