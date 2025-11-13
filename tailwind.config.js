/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      /** 颜色 */
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        backgroundSubtle: 'rgb(var(--backgroundSubtle) / <alpha-value>)',
        textPrimary: 'rgb(var(--textPrimary) / <alpha-value>)',
        textSecondary: 'rgb(var(--textSecondary) / <alpha-value>)',
        textDisabled: 'rgb(var(--textDisabled) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        borderStrong: 'rgb(var(--borderStrong) / <alpha-value>)',
        shadow: 'rgb(var(--shadow) / <alpha-value>)',
        shadowStrong: 'rgb(var(--shadowStrong) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        successBg: 'rgb(var(--successBg) / <alpha-value>)',
        info: 'rgb(var(--info) / <alpha-value>)',
        infoBg: 'rgb(var(--infoBg) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        dangerBg: 'rgb(var(--dangerBg) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        warningBg: 'rgb(var(--warningBg) / <alpha-value>)',
      },

      /** 动画 */
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-3px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(4px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-6px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(6px, 0, 0)' },
        },
      },
      animation: {
        shake: 'shake .4s cubic-bezier(0.28, -0.44, 0.65, 1.55) 2 both',
      },
      /** 阴影预设（基于变量） */
      boxShadow: {
        'card': '0 0 0 1px rgb(var(--border) / 1) inset, 0 3px 10px 0 rgb(var(--shadowStrong) / 1)',
        'card-inset': '0 0 4px 4px rgb(var(--shadowStrong) / 1) inset',
      },
    },
  },
  plugins: [
    /** 自定义工具类 */
    function ({ addUtilities, addComponents, theme }) {
      /** 隐藏滚动条 */
      addUtilities({
        '.hide-scroll': {
          /* Firefox - 保持滚动条占用空间，但颜色透明 */
          'scrollbar-width': 'thin',
          'scrollbar-color': 'transparent transparent',
          /* IE & Edge */
          '-ms-overflow-style': 'auto',
          /* Safari & Chrome - 保持滚动条占用空间，但颜色透明 */
          '&::-webkit-scrollbar': {
            width: '7px',
            height: '7px',
          },
          '&::-webkit-scrollbar-track': {
            'background-color': 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            'background-color': 'transparent',
            'border-radius': '6px',
            'border': '2px solid transparent',
            'background-clip': 'padding-box',
          },
          /* 鼠标悬停或聚焦时显示滚动条颜色 */
          '&:hover': {
            'scrollbar-color': 'var(--scrollbarThumb) transparent',
            '&::-webkit-scrollbar-thumb': {
              'background-color': 'var(--scrollbarThumb)',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              'background-color': 'var(--scrollbarThumbHover)',
            },
          },
          '&:focus-within': {
            'scrollbar-color': 'var(--scrollbarThumb) transparent',
            '&::-webkit-scrollbar-thumb': {
              'background-color': 'var(--scrollbarThumb)',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              'background-color': 'var(--scrollbarThumbHover)',
            },
          },
        },
      })

      /** 居中工具 */
      addComponents({
        '.center-x': {
          left: '50%',
          transform: 'translateX(-50%)',
        },
        '.center-y': {
          top: '50%',
          transform: 'translateY(-50%)',
        },
        '.center': {
          '@apply center-x center-y': {},
        },
      })

      /** 调色快捷类 (text + bg) */
      const toning = [
        'green',
        'blue',
        'purple',
        'orange',
        'red',
        'yellow',
        'gray',
        'slate',
      ]
      toning.forEach((color) => {
        addComponents({
          [`.toning-${color}`]: {
            'color': `var(--${color}TextColor)`,
            'backgroundColor': `var(--${color}BgColor)`,
          },
          [`.toning-${color}-text`]: {
            'color': `var(--${color}TextColor)`,
          },
          [`.toning-${color}-border`]: {
            'borderColor': `var(--${color}BorderColor)`,
          },
        })
      })
    },
  ],
}
