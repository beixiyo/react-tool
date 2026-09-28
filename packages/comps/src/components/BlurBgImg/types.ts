/**
 * BlurBgImg 组件类型声明
 */

export type BlurBgImgProps =
  & {
    className?: string
    imgClassName?: string
    style?: React.CSSProperties
    children?: React.ReactNode
    img: string
    /** 模糊半径，默认 `15px` */
    blur?: string
    /**
     * 是否渲染前景层（原图或 children），默认 true
     * 设为 false 时只渲染模糊背景，适合纯背景装饰场景
     * @default true
     */
    showForeground?: boolean
    /**
     * 启用颜色流动动画：背景图缓慢漂移 + 色相微动
     * @default false
     */
    flow?: boolean
    /**
     * 漂移动画单次周期（秒），越大越慢。色相动画自动以 ×1.7 错频
     * @default 20
     */
    flowDuration?: number
    /**
     * 动画振幅倍率（无量纲）。同时缩放位移幅度、色相偏移、饱和度变化
     * 0.5 = 更柔和，2 = 更强烈
     * @default 1
     */
    flowAmplitude?: number
    /**
     * 模糊背景层的放大比例（相对容器尺寸）。值越大留白余量越多，
     * 漂移幅度（`flowAmplitude`）较大时可调高以避免露边
     * @default 1.25
     */
    bgScale?: number
  }
  & React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>
