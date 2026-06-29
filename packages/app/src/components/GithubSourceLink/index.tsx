import { useLocation } from '@jl-org/react-router'
import { Github } from 'lucide-react'
import { cn } from 'utils'

const GITHUB_REPO_URL = 'https://github.com/beixiyo/react-tool'
const GITHUB_SOURCE_BASE = `${GITHUB_REPO_URL}/blob/main`

const sourceFiles = {
  ...import.meta.glob('/src/views/**/page.tsx'),
  ...import.meta.glob('/src/components/**/Test.tsx'),
} as Record<string, unknown>

const SOURCE_PREFIXES = {
  views: '/src/views',
  components: '/src/components',
} as const

const SOURCE_REPO_PREFIXES = {
  views: '/packages/app/src/views',
  components: '/packages/app/src/components',
} as const

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizePath(path: string) {
  const normalized = path.replace(/\/+$/, '') || '/'

  return normalized.toLowerCase()
}

function toRoutePath(sourcePath: string, type: keyof typeof SOURCE_PREFIXES) {
  const sourcePrefix = SOURCE_PREFIXES[type]
  const routeSuffix = type === 'views' ? '/page.tsx' : '/Test.tsx'

  return sourcePath
    .replace(sourcePrefix, '')
    .replace(routeSuffix, '')
    .replace(/\/+/g, '/')
    .replace(/\/+$/, '/') || '/'
}

function toRepoPath(sourcePath: string, type: keyof typeof SOURCE_PREFIXES) {
  return sourcePath.replace(SOURCE_PREFIXES[type], SOURCE_REPO_PREFIXES[type])
}

function toMatcherRegExp(routePath: string) {
  const escaped = routePath
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      if (segment.startsWith('[') && segment.endsWith(']')) {
        const inner = segment.slice(1, -1)

        if (inner.startsWith('...'))
          return '/.+?'

        return '/[^/]+'
      }

      return `/${escapeRegExp(segment)}`
    })
    .join('')

  return new RegExp(`^${escaped || '/'}$`)
}

const routeSourceList = Object.keys(sourceFiles)
  .map((sourcePath) => {
    const type = sourcePath.includes('/src/views/')
      ? 'views'
      : 'components'

    const routePath = toRoutePath(sourcePath, type)

    return {
      exactMatch: normalizePath(routePath),
      matcher: toMatcherRegExp(routePath.toLowerCase()),
      repoPath: toRepoPath(sourcePath, type),
    }
  })
  .sort((a, b) => b.exactMatch.length - a.exactMatch.length)

function getSourceFileUrlByPath(pathname: string) {
  const path = normalizePath(pathname)

  const exactMatch = routeSourceList.find(item => item.exactMatch === path)
  if (exactMatch)
    return `${GITHUB_SOURCE_BASE}${encodeURI(exactMatch.repoPath)}`

  const matched = routeSourceList.find(item => item.matcher.test(path))
  if (matched)
    return `${GITHUB_SOURCE_BASE}${encodeURI(matched.repoPath)}`

  const segments = path.split('/').filter(Boolean)
  for (let i = segments.length - 1; i >= 1; i--) {
    const prefix = `/${segments.slice(0, i).join('/')}`
    const prefixMatch = routeSourceList.find(item => item.exactMatch === prefix)
    if (prefixMatch)
      return `${GITHUB_SOURCE_BASE}${encodeURI(prefixMatch.repoPath)}`
  }

  return GITHUB_REPO_URL
}

export function GithubSourceLink(props: GithubSourceLinkProps) {
  const { className, href: customHref } = props
  const location = useLocation()
  const href = customHref ?? getSourceFileUrlByPath(location.pathname)

  return (
    <a
      href={ href }
      target="_blank"
      rel="noopener noreferrer"
      aria-label="当前页面 GitHub 源码"
      title="查看当前页面源码"
      className={ cn(
        'fixed top-4 right-4 z-[200] flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background shadow-lg backdrop-blur-sm transition hover:border-systemBlue hover:bg-background2 hover:text-systemBlue',
        className,
      ) }
    >
      <Github className="h-5 w-5" />
    </a>
  )
}

type GithubSourceLinkProps = {
  className?: string
  href?: string
}
