import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'

export const prefetchPlugin: PrefetchPlugin = (option) => {
  let config: ResolvedConfig // 存储解析后的配置

  return {
    name: 'vite-plugin-bundle-prefetch', // 插件名称
    apply: 'build', // 只在构建阶段应用
    configResolved(resolvedConfig: ResolvedConfig) {
      config = resolvedConfig
    },
    transformIndexHtml(
      html: string,
      ctx: {
        path: string
        filename: string
        server?: ViteDevServer
        bundle?: import('rollup').OutputBundle
        chunk?: import('rollup').OutputChunk
      },
    ) {
      const bundles = Object.keys(ctx.bundle ?? {}) // 获取所有打包文件的名称
      const isLegacy = bundles.some(bundle => bundle.includes('legacy')) // 判断是否为老旧浏览器构建
      if (isLegacy) {
        // 如果是老旧浏览器构建，则不添加prefetch
        return html
      }
      // 移除.map文件
      let modernBundles = bundles.filter(
        bundle => bundle.endsWith('.map') === false,
      )
      const excludeFn = option?.excludeFn
      if (excludeFn) {
        // 如果存在排除函数，则过滤掉需要排除的文件
        modernBundles = modernBundles.filter(bundle => !excludeFn(bundle))
      }
      // 移除已经存在的文件并将它们拼接成link标签
      const prefechBundlesString = modernBundles
        .filter(bundle => html.includes(bundle) === false)
        .map(bundle => `<link rel="prefetch" href="${config.base}${bundle}">`)
        .join('\n')

      // 使用正则表达式获取<head> </head>内的内容
      const headContent = html.match(/<head>([\s\S]*)<\/head>/)?.[1] ?? ''
      // 将prefetch内容插入到head中
      const newHeadContent = `${headContent}${prefechBundlesString}`
      // 替换原始的head
      html = html.replace(
        /<head>([\s\S]*)<\/head>/,
        `<head>${newHeadContent}</head>`,
      )

      return html
    },
  } as Plugin
}

interface IPrefetchPluginOption {
  excludeFn?: (assetName: string) => boolean
}
type PrefetchPlugin = (option?: IPrefetchPluginOption) => Plugin
