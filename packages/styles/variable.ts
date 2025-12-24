export default {
  light: {
    // 🪟 背景色 —— 与 Figma 对齐
    background: '255 255 255', // Bg Primary #FFFFFF
    backgroundSecondary: '245 245 245', // Bg Secondary #F5F5F5
    backgroundTertiary: '232 232 232', // Bg Tertiary #E8E8E8
    backgroundQuaternary: '222 222 222', // Bg Quaternary #DEDEDE

    // ✍️ 文字颜色 —— 分级控制（按设计稿更新）
    textPrimary: '0 0 0', // #000000
    textSecondary: '0 0 0', // #000000 70% (通过 alpha 控制)
    textTertiary: '0 0 0', // #000000 60% (通过 alpha 控制)
    textQuaternary: '0 0 0', // #000000 30% (通过 alpha 控制)
    textDisabled: '0 0 0', // #000000 10% (通过 alpha 控制)

    // 📏 边框 —— 按设计稿更新
    border: '243 244 246',
    borderSecondary: '235 235 235', // Border Secondary #EBEBEB
    borderStrong: '229 223 229',

    // 🖌️ 阴影 —— 极简投影，克制使用
    shadow: '0 0 0',
    shadowAlpha: '0.05',
    shadowStrong: '0 0 0',

    // 📜 滚动条 —— 轨道与滑块
    scrollbarTrack: 'transparent',
    scrollbarThumb: 'rgba(0, 0, 0, 0.2)',
    scrollbarThumbHover: 'rgba(0, 0, 0, 0.35)',

    // 状态色（与 Figma 状态色对齐）
    success: '52 199 89', // 状态 / 绿 #34c759
    successBg: '236 253 245',
    info: '65 156 255', // 状态 / 蓝 #419cff
    infoBg: '239 246 255',
    danger: '255 86 94', // 状态 / 红 #ff565e
    dangerBg: '254 242 242',
    warning: '250 193 65', // 状态 / 黄 #fac141
    warningBg: '254 243 199',

    // 品牌与导航背景（来自 Figma 变量）
    brand: '85 96 245', // #5560F5
    navBg: '255 255 255', // Figma 全局 / W Nav #ffffff

    // 按钮颜色
    buttonPrimary: '0 0 0', // Button Primary #000000
    buttonSecondary: '245 245 245', // Button Secondary #F5F5F5
    buttonTertiary: '255 255 255', // Button Tertiary #FFFFFF

    // 系统色（System 彩色）
    systemRed: '255 86 94', // 红 #FF565E
    systemOrange: '255 151 74', // 橙 #FF974A
    systemYellow: '250 193 65', // 黄 #FAC141
    systemGreen: '52 199 89', // 绿 #34C759
    systemBlue: '65 156 255', // 蓝 #419CFF
    systemPurple: '233 56 246', // 紫 #E938F6

    // 绿色调色
    toningGreenTextColor: '#059669',
    toningGreenBgColor: '#ECFDF5',
    toningGreenBorderColor: '#10B981',

    // 蓝色调色
    toningBlueTextColor: '#2563EB',
    toningBlueBgColor: '#EFF6FF',
    toningBlueBorderColor: '#3B82F6',

    // 紫色调色
    toningPurpleTextColor: '#9333EA',
    toningPurpleBgColor: '#FAF5FF',
    toningPurpleBorderColor: '#A855F7',

    // 橙色调色
    toningOrangeTextColor: '#EA580C',
    toningOrangeBgColor: '#FFF7ED',
    toningOrangeBorderColor: '#F97316',

    // 红色调色
    toningRedTextColor: '#DC2626',
    toningRedBgColor: '#FEF2F2',
    toningRedBorderColor: '#EF4444',

    // 黄色调色
    toningYellowTextColor: '#D97706',
    toningYellowBgColor: '#FEF3C7',
    toningYellowBorderColor: '#F59E0B',

    // 灰色调色
    toningGrayTextColor: '#6B7280',
    toningGrayBgColor: '#F3F4F6',
    toningGrayBorderColor: '#9CA3AF',

    // 石板色调色
    toningSlateTextColor: '#374151',
    toningSlateBgColor: '#f3f4f6',
    toningSlateBorderColor: '#64748B',

    // 骨架屏颜色 token（light）
    skeletonBase: '245 246 248',
    skeletonHighlight: '233 236 239',
  },
  dark: {
    // 🪟 背景色 —— 以深灰为主，避免死黑
    background: '0 0 0',
    backgroundSecondary: '20 20 20',
    backgroundTertiary: '30 30 30', // 需要根据设计稿调整
    backgroundQuaternary: '40 40 40', // 需要根据设计稿调整

    // ✍️ 文字颜色 —— 反转对比
    textPrimary: '249 250 251',
    textSecondary: '156 163 175',
    textTertiary: '156 163 175', // 需要根据设计稿调整
    textQuaternary: '107 114 128', // 需要根据设计稿调整
    textDisabled: '107 114 128',

    // 📏 边框 —— 用于组件分界
    border: '41 41 50',
    borderSecondary: '52 52 60', // 需要根据设计稿调整
    borderStrong: '52 52 60',

    // 🖌️ 阴影 —— 始终使用黑色
    shadow: '0 0 0',
    shadowAlpha: '0.06',
    shadowStrong: '0 0 0',

    // 📜 滚动条 —— 轨道与滑块
    scrollbarTrack: 'transparent',
    scrollbarThumb: 'rgba(255, 255, 255, 0.2)',
    scrollbarThumbHover: 'rgba(255, 255, 255, 0.35)',

    // 状态色（深色，与 Figma 状态色对齐）
    success: '48 209 88', // #30D158
    successBg: '6 78 59',
    info: '65 156 255', // #419CFF
    infoBg: '30 58 138',
    danger: '255 86 94', // #FF565E
    dangerBg: '127 29 29',
    warning: '255 197 66', // #FFC542
    warningBg: '120 53 15',

    // 品牌与导航背景（暗色占位，需根据 Figma 暗色稿再精调）
    brand: '85 96 245', // #5560F5
    navBg: '0 0 0', // Figma 全局 / B Nav #000000

    // 按钮颜色（需要根据设计稿调整）
    buttonPrimary: '255 255 255',
    buttonSecondary: '40 40 40',
    buttonTertiary: '20 20 20',

    // 系统色（System 彩色）
    systemRed: '255 86 94', // 红 #FF565E
    systemOrange: '255 151 74', // 橙 #FF974A
    systemYellow: '255 197 66', // 黄 #FFC542
    systemGreen: '48 209 88', // 绿 #30D158
    systemBlue: '65 156 255', // 蓝 #419CFF
    systemPurple: '233 56 246', // 紫 #E938F6

    // 绿色调色
    toningGreenTextColor: '#34D399',
    toningGreenBgColor: '#064E3B',
    toningGreenBorderColor: '#065F46',

    // 蓝色调色
    toningBlueTextColor: '#60A5FA',
    toningBlueBgColor: '#1E3A8A',
    toningBlueBorderColor: '#2563EB',

    // 紫色调色
    toningPurpleTextColor: '#A78BFA',
    toningPurpleBgColor: '#4C1D95',
    toningPurpleBorderColor: '#7E22CE',

    // 橙色调色
    toningOrangeTextColor: '#FB923C',
    toningOrangeBgColor: '#7C2D12',
    toningOrangeBorderColor: '#C2410C',

    // 红色调色
    toningRedTextColor: '#F87171',
    toningRedBgColor: '#7F1D1D',
    toningRedBorderColor: '#B91C1C',

    // 黄色调色
    toningYellowTextColor: '#FBBF24',
    toningYellowBgColor: '#78350F',
    toningYellowBorderColor: '#B45309',

    // 灰色调色
    toningGrayTextColor: '#9CA3AF',
    toningGrayBgColor: '#1F2937',
    toningGrayBorderColor: '#4B5563',

    // 石板色调色
    toningSlateTextColor: '#E5E7EB',
    toningSlateBgColor: '#0F172A',
    toningSlateBorderColor: '#334155',

    // 骨架屏颜色 token（dark）
    skeletonBase: '28 28 30',
    skeletonHighlight: '50 50 60',
  }
}
