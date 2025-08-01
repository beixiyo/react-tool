import presetLegacyCompat from '@unocss/preset-legacy-compat'
import presetWind3 from '@unocss/preset-wind3'
import {
  defineConfig,
  presetAttributify,
  transformerAttributifyJsx,
  transformerVariantGroup,
} from 'unocss'
import * as Variable from './src/styles/variable'

const shake = `
{
  10%,
  90% {
    transform: translate3d(-3px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(4px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-6px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(6px, 0, 0);
  }
}
`

export default defineConfig({
  presets: [
    /** 使用 presetWind 插件以兼容 Tailwind CSS */
    presetWind3(),
    /**
     * 属性化书写样式，要配合 transformerAttributifyJsx 使用
     * <div class="m-2 rounded text-teal-400" />
     * <!-- 现在你可以这么写： -->
     * <div m-2 rounded text-teal-400 />
     */
    presetAttributify(),

    /**
     * 兼容旧版 CSS
     */
    presetLegacyCompat({
      commaStyleColorFunction: true,
      legacyColorSpace: true,
    }),
  ],

  transformers: [
    /**
     * 无值化 JSX
     * 如果没有这个转换器，JSX会将无值属性视为布尔属性
     */
    transformerAttributifyJsx(),
    /**
     * <div class="hover:bg-gray-400 hover:font-medium font-light font-mono"/>
     * <!-- 简化之后： -->
     * <div class="hover:(bg-gray-400 font-medium) font-(light mono)"/>
     */
    transformerVariantGroup(),
  ],

  /** 配置主题 */
  theme: {
    colors: {
      lightBg: Variable.lightBg, /** 背景色 */
      innerBg: Variable.innerBg, /** 内部背景色 */
      primary: Variable.primaryColor, /** 主色 */
      border: Variable.borderColor, /** 边框色 */
      light: Variable.lightTextColor, /** 文字浅色 */
      success: Variable.successColor, /** 成功色 */
      info: Variable.infoColor, /** 信息色 */
      danger: Variable.dangerColor, /** 危险色 */
    },

    animation: {
      keyframes: {
        shake,
      },
      durations: {
        shake: '.4s',
      },
      timingFns: {
        shake: 'cubic-bezier(0.28, -0.44, 0.65, 1.55)',
      },
      properties: {
        shake: { 'animation-fill-mode': 'both' },
      },
      counts: {
        shake: '2',
      },
    },
  },

  /** 自定义工具类 */
  shortcuts: {
    'hide-scroll': [
      // Firefox
      '[scrollbar-width:none]',
      // IE and Edge
      '[-ms-overflow-style:none]',
      // Safari and Chrome (using variant group for pseudo-element)
      '[&::-webkit-scrollbar]:hidden', // 'hidden' is a utility for 'display: none;'
    ].join(' '),

    'center-x': 'left-1/2 -translate-x-1/2',
    'center-y': 'top-1/2 -translate-y-1/2',
    'center': 'center-x center-y',

    // ======================
    // * 调色
    // ======================
    'toning-green': `text-${Variable.greenTextColor} bg-${Variable.greenBgColor} dark:text-${Variable.greenDarkTextColor} dark:bg-${Variable.greenDarkBgColor}`,
    'toning-blue': `text-${Variable.blueTextColor} bg-${Variable.blueBgColor} dark:text-${Variable.blueDarkTextColor} dark:bg-${Variable.blueDarkBgColor}`,
    'toning-purple': `text-${Variable.purpleTextColor} bg-${Variable.purpleBgColor} dark:text-${Variable.purpleDarkTextColor} dark:bg-${Variable.purpleDarkBgColor}`,
    'toning-orange': `text-${Variable.orangeTextColor} bg-${Variable.orangeBgColor} dark:text-${Variable.orangeDarkTextColor} dark:bg-${Variable.orangeDarkBgColor}`,
    'toning-red': `text-${Variable.redTextColor} bg-${Variable.redBgColor} dark:text-${Variable.redDarkTextColor} dark:bg-${Variable.redDarkBgColor}`,
    'toning-yellow': `text-${Variable.yellowTextColor} bg-${Variable.yellowBgColor} dark:text-${Variable.yellowDarkTextColor} dark:bg-${Variable.yellowDarkBgColor}`,
    'toning-gray': `text-${Variable.grayTextColor} bg-${Variable.grayBgColor} dark:text-${Variable.grayDarkTextColor} dark:bg-${Variable.grayDarkBgColor}`,
    'toning-slate': `text-${Variable.slateTextColor} bg-${Variable.slateBgColor} dark:text-${Variable.slateDarkTextColor} dark:bg-${Variable.slateDarkBgColor}`,

    'toning-green-text': `text-${Variable.greenTextColor} dark:text-${Variable.greenDarkTextColor}`,
    'toning-blue-text': `text-${Variable.blueTextColor} dark:text-${Variable.blueDarkTextColor}`,
    'toning-purple-text': `text-${Variable.purpleTextColor} dark:text-${Variable.purpleDarkTextColor}`,
    'toning-orange-text': `text-${Variable.orangeTextColor} dark:text-${Variable.orangeDarkTextColor}`,
    'toning-red-text': `text-${Variable.redTextColor} dark:text-${Variable.redDarkTextColor}`,
    'toning-yellow-text': `text-${Variable.yellowTextColor} dark:text-${Variable.yellowDarkTextColor}`,
    'toning-gray-text': `text-${Variable.grayTextColor} dark:text-${Variable.grayDarkTextColor}`,
    'toning-slate-text': `text-${Variable.slateTextColor} dark:text-${Variable.slateDarkTextColor}`,

    'toning-green-border': `border-${Variable.greenBorderColor} dark:border-${Variable.greenDarkBorderColor}`,
    'toning-blue-border': `border-${Variable.blueBorderColor} dark:border-${Variable.blueDarkBorderColor}`,
    'toning-purple-border': `border-${Variable.purpleBorderColor} dark:border-${Variable.purpleDarkBorderColor}`,
    'toning-orange-border': `border-${Variable.orangeBorderColor} dark:border-${Variable.orangeDarkBorderColor}`,
    'toning-red-border': `border-${Variable.redBorderColor} dark:border-${Variable.redDarkBorderColor}`,
    'toning-yellow-border': `border-${Variable.yellowBorderColor} dark:border-${Variable.yellowDarkBorderColor}`,
    'toning-gray-border': `border-${Variable.grayBorderColor} dark:border-${Variable.grayDarkBorderColor}`,
    'toning-slate-border': `border-${Variable.slateBorderColor} dark:border-${Variable.slateDarkBorderColor}`,
  },

  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|vine.ts|mdx?|astro|elm|php|phtml|html)($|\?)/,
        // include js/ts files
        'src/**/*.{js,ts}',
      ],
      // exclude: []
    },
  },
})
