import type { MockPost } from './test.data'
import { useViewTransitionState } from 'hooks'
import { ChevronLeft } from 'lucide-react'
import { TransitionItem } from '.'
import { LIST_ID, mockPosts } from './test.data'

export default function ViewTransitionTestPage() {
  const [id, setId] = useViewTransitionState(LIST_ID)
  const post = mockPosts.find(p => p.id === id)

  return (
    <div className="antialiased">
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
    <div className="relative h-screen overflow-auto bg-slate-50 p-4 dark:bg-slate-900 lg:p-8 sm:p-6">
      <header className="mb-8 text-center">
        <h1 className="text-4xl text-slate-800 font-bold tracking-tight sm:text-5xl dark:text-slate-100">
          View Transition API 示例
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          点击任意卡片，体验流畅的Hero Transition进入详情。
        </p>
      </header>

      <div className="grid grid-cols-1 gap-x-6 gap-y-10 lg:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4">
        { mockPosts.map(post => (
          <div
            key={ post.id }
            className="group relative flex flex-col cursor-pointer overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 ease-in-out dark:bg-slate-800 hover:shadow-2xl hover:-translate-y-1.5"
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
                /** 帮助浏览器计算固有尺寸 */
                // style={ { containIntrinsicSize: '300px 187.5px' } }
              />
            </TransitionItem>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <h2 className="text-lg text-slate-900 font-semibold dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                { post.title }
              </h2>
              {/* </HeroElement> */ }
              <p className="line-clamp-2 mt-2 flex-1 text-sm text-slate-600 dark:text-slate-400">
                { post.excerpt }
              </p>
              <span className="mt-3 inline-block self-start rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700 font-medium dark:bg-blue-900/50 dark:text-blue-300">
                { post.category }
              </span>
            </div>
          </div>
        )) }
      </div>
      <footer className="mt-12 border-t border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
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
      <div className="h-screen flex items-center justify-center text-red-500 dark:text-red-400">
        帖子数据加载失败或不存在。
        <button
          onClick={ () => onClick(LIST_ID) }
          className="ml-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          返回列表
        </button>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-auto bg-slate-50 py-8 dark:bg-slate-900 md:py-12">
      <button
        onClick={ () => onClick(LIST_ID) }
        className="absolute left-4 top-4 z-50 h-10 w-10 flex items-center justify-center rounded-full bg-white/70 text-slate-700 shadow-lg backdrop-blur-xs transition-all hover:scale-110 dark:bg-slate-800/70 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-700"
        aria-label="返回列表"
      >
        <ChevronLeft size={ 24 } strokeWidth={ 2.5 } />
      </button>

      <article className="mx-auto max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-800">
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
          {/* <HeroElement transitionName={titleTransitionName} as="h1"> */ }
          <h1 className="mb-3 text-3xl text-slate-900 font-bold tracking-tight md:text-5xl sm:text-4xl dark:text-slate-100">
            { post.title }
          </h1>

          {/* </HeroElement> */ }
          <p className="mb-6 text-sm text-blue-600 font-medium tracking-wider uppercase dark:text-blue-400">
            { post.category }
          </p>
          <div className="prose dark:prose-invert prose-lg prose-slate max-w-none text-slate-700 dark:text-slate-300">
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
