/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      /** 颜色 */
      colors: {
        primaryTextColor: 'var(--primaryTextColor)',
        primaryBgColor: 'var(--primaryBgColor)',
        defaultTextColor: 'var(--defaultTextColor)',
        defaultBgColor: 'var(--defaultBgColor)',
        outlineHoverBg: 'var(--outlineHoverBg)',
        background: 'var(--background)',
        backgroundSubtle: 'var(--backgroundSubtle)',
        textPrimary: 'var(--textPrimary)',
        textSecondary: 'var(--textSecondary)',
        textDisabled: 'var(--textDisabled)',
        border: 'var(--border)',
        borderStrong: 'var(--borderStrong)',
        shadow: 'var(--shadow)',
        shadowStrong: 'var(--shadowStrong)',
        success: 'var(--success)',
        successBg: 'var(--successBg)',
        info: 'var(--info)',
        infoBg: 'var(--infoBg)',
        danger: 'var(--danger)',
        dangerBg: 'var(--dangerBg)',
        warning: 'var(--warning)',
        warningBg: 'var(--warningBg)',
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
