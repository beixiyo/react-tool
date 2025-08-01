const fs = require('node:fs')
const path = require('node:path')
/**
 * pnpm i sitemap -D
 */
const { SitemapStream, streamToPromise } = require('sitemap')

/**
 * 定义网站的静态路由列表
 */
const links = [
  { url: '/', changefreq: 'weekly', priority: 1.0, lastmod: new Date().toISOString() },
  { url: '/event', changefreq: 'weekly', priority: 1.0, lastmod: new Date().toISOString() },
]

generateSitemap()

async function generateSitemap() {
  const smStream = new SitemapStream({
    hostname: 'https://example.com',
  })

  /** 添加链接 */
  links.forEach(link => smStream.write(link))
  smStream.end()

  const sitemapXML = await streamToPromise(smStream)

  /** 写入 sitemap.xml */
  fs.writeFileSync(
    path.resolve(path.resolve(__dirname, '../dist'), 'sitemap.xml'),
    sitemapXML,
  )

  console.log('Sitemap 已生成')
}
