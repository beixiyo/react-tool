import { useLocation } from '@jl-org/react-router'
import { Github } from 'lucide-react'
import { cn } from 'utils'

const GITHUB_REPO_URL = 'https://github.com/beixiyo/react-tool'
const GITHUB_SOURCE_BASE = `${GITHUB_REPO_URL}/blob/main`

const sourceFiles = import.meta.glob('../*/Test.tsx') as Record<string, unknown>

const SOURCE_PREFIX = '../'
const SOURCE_REPO_PREFIX = '/packages/comps/src/components/'

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizePath(path: string) {
  const normalized = path.replace(/\/+$/, '') || '/'

  return normalized.toLowerCase()
}

function toRelativeSourcePath(sourcePath: string) {
  return sourcePath.startsWith(SOURCE_PREFIX)
    ? sourcePath.slice(SOURCE_PREFIX.length)
    : sourcePath
}

function toRoutePath(sourcePath: string) {
  const routeName = toRelativeSourcePath(sourcePath)
    .replace(/\/Test\.tsx$/, '')
    .replace(/\/+/g, '/')
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .at(-1)

  return routeName
    ? `/${routeName}`
    : '/'
}

function toRepoPath(sourcePath: string) {
  return `${SOURCE_REPO_PREFIX}${toRelativeSourcePath(sourcePath)}`
}

function toMatcherRegExp(routePath: string) {
  const escaped = routePath
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      if (segment.startsWith('[') && segment.endsWith(']')) {
        const inner = segment.slice(1, -1)

        if (inner.startsWith('...')) return '/.+?'

        return '/[^/]+'
      }

      return `/${escapeRegExp(segment)}`
    })
    .join('')

  return new RegExp(`^${escaped || '/'}$`)
}

const routeSourceList = Object.keys(sourceFiles)
  .map((sourcePath) => {
    const routePath = toRoutePath(sourcePath)

    return {
      exactMatch: normalizePath(routePath),
      matcher: toMatcherRegExp(routePath.toLowerCase()),
      repoPath: toRepoPath(sourcePath),
    }
  })
  .sort((a, b) => b.exactMatch.length - a.exactMatch.length)

function getSourceFileUrlByPath(pathname: string) {
  const path = normalizePath(pathname)

  const exactMatch = routeSourceList.find((item) => item.exactMatch === path)
  if (exactMatch) return `${GITHUB_SOURCE_BASE}${encodeURI(exactMatch.repoPath)}`

  const matched = routeSourceList.find((item) => item.matcher.test(path))
  if (matched) return `${GITHUB_SOURCE_BASE}${encodeURI(matched.repoPath)}`

  return GITHUB_REPO_URL
}

export function GithubSourceLink(props: GithubSourceLinkProps) {
  const { className } = props
  const location = useLocation()
  const href = getSourceFileUrlByPath(location.pathname)

  return (
    <a
      href={ href }
      target="_blank"
      rel="noopener noreferrer"
      aria-label="当前页面 GitHub 源码"
      title="查看当前页面源码"
      className={ cn(
        'fixed top-4 right-4 z-200 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background shadow-lg backdrop-blur-sm transition hover:border-systemBlue hover:bg-background2 hover:text-systemBlue',
        className,
      ) }
    >
      <Github className="h-5 w-5" />
    </a>
  )
}

type GithubSourceLinkProps = {
  className?: string
}
