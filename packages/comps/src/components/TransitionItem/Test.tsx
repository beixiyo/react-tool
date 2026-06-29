import type { MockPost } from './test.data'
import { useViewTransitionState } from 'hooks'
import { ChevronLeft } from 'lucide-react'
import { TransitionItem } from '.'
import { Button } from '../Button'
import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'
import { LIST_ID, mockPosts } from './test.data'

function ViewTransitionTestPage() {
  const [id, setId] = useViewTransitionState(LIST_ID)
  const post = mockPosts.find(p => p.id === id)

  return (
    <div className="antialiased">
      <div className="fixed right-4 top-4 z-50 flex items-center gap-3">
        <ThemeToggle />
        <GithubSourceLink className="static" />
      </div>

      { id !== LIST_ID
        ? <PostDetail
            post={ post! }
            onClick={ setId }
          />
        : <PostList onClick={ setId } /> }
    </div>
  )
}

const PostList: React.FC<PostListParams> = ({ onClick }) => {
  return (
    <div className="relative h-screen overflow-auto bg-background p-4 text-text lg:p-8 sm:p-6">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          View Transition API 示例
        </h1>
        <p className="mt-4 text-lg text-text2">
          点击任意卡片，体验流畅的Hero Transition进入详情。
        </p>
      </header>

      <div className="grid grid-cols-1 gap-x-6 gap-y-10 lg:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4">
        { mockPosts.map(post => (
          <div
            key={ post.id }
            className="group relative flex flex-col cursor-pointer overflow-hidden rounded-xl bg-background2 shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1.5"
            onClick={ () => {
              onClick(post.id)
            } }
          >
            <TransitionItem
              transitionName={ post.id }
              className="aspect-16/10 overflow-hidden"
            >
              <img
                src={ post.imageUrlSmall }
                alt={ post.title }
                className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
              />
            </TransitionItem>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <h2 className="text-lg font-semibold group-hover:text-systemBlue">
                { post.title }
              </h2>
              <p className="line-clamp-2 mt-2 flex-1 text-sm text-text2">
                { post.excerpt }
              </p>
              <span className="mt-3 inline-block self-start rounded-full bg-systemBlue/10 px-3 py-1 text-xs text-systemBlue font-medium">
                { post.category }
              </span>
            </div>
          </div>
        )) }
      </div>
      <footer className="mt-12 border-t border-border py-8 text-center text-sm text-text3">
        View Transition API 示例 ©
        { ' ' }
        { new Date().getFullYear() }
      </footer>
    </div>
  )
}

const PostDetail: React.FC<PostDetailParams> = ({ onClick, post }) => {
  if (!post) {
    /** 如果没有帖子数据，显示错误或加载状态 */
    return (
      <div className="h-screen flex items-center justify-center bg-background text-danger">
        帖子数据加载失败或不存在。
        <Button
          variant="primary"
          className="ml-4"
          onClick={ () => onClick(LIST_ID) }
        >
          返回列表
        </Button>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-auto bg-background py-8 text-text md:py-12">
      <button
        onClick={ () => onClick(LIST_ID) }
        className="absolute left-4 top-4 z-50 h-10 w-10 flex items-center justify-center rounded-full bg-background2/70 text-text2 shadow-lg backdrop-blur-xs transition-all hover:scale-110 hover:bg-background2"
        aria-label="返回列表"
      >
        <ChevronLeft size={ 24 } strokeWidth={ 2.5 } />
      </button>

      <article className="mx-auto max-w-4xl overflow-hidden rounded-xl bg-background2 shadow-2xl">
        <TransitionItem
          transitionName={ post.id }
          className="aspect-video w-full overflow-hidden md:aspect-2/1"
        >
          <img
            src={ post.imageUrlLarge }
            alt={ post.title }
            className="h-full w-full object-cover"
            style={ { containIntrinsicSize: '800px 400px' } }
          />
        </TransitionItem>

        <div className="p-6 md:p-10 sm:p-8">
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-5xl sm:text-4xl">
            { post.title }
          </h1>

          <p className="mb-6 text-sm text-systemBlue font-medium tracking-wider uppercase">
            { post.category }
          </p>
          <div className="prose dark:prose-invert prose-lg prose-slate max-w-none text-text2">
            <p className="lead">{ post.excerpt }</p>
            <p>{ post.fullContent }</p>
          </div>
        </div>
      </article>
    </div>
  )
}

interface PostDetailParams {
  onClick: (id: string) => void
  post: MockPost
}

interface PostListParams {
  onClick: (id: string) => void
}

export default ViewTransitionTestPage
