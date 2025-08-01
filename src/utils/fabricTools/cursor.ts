import { BRUSH_COLOR, DEFAULT_STROKE_WIDTH } from './constant'

export function getCursor(size = DEFAULT_STROKE_WIDTH, color = BRUSH_COLOR) {
  const circle = `
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width='${size}'
        height='${size}'
        fill='${color}'
        viewBox='0 0 ${size * 2} ${size * 2}'
    >
      <circle
        r='${size}'
        cy='50%'
        cx='50%'
      />
    </svg>`

  const cursorData = `data:image/svg+xml;base64,${window.btoa(circle)}`

  return `url(${cursorData}) ${size / 2} ${size / 2}, crosshair`
}
