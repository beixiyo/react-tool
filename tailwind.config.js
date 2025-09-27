/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      /** 颜色 */
      colors: {
        primary: 'var(--primary)',
        primaryHover: 'var(--primaryHover)',
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
        info: 'var(--info)',
        danger: 'var(--danger)',
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
          /* Firefox */
          'scrollbar-width': 'none',
          /* IE & Edge */
          '-ms-overflow-style': 'none',
          /* Safari & Chrome */
          '&::-webkit-scrollbar': {
            display: 'none',
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
