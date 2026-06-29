import { cn } from 'utils'
import { GithubSourceLink } from '@/components/GithubSourceLink'
import { CutoutImg } from './CutoutImg'

function Test() {
  return <div
    className={ cn(
      'size-full flex flex-col items-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800',
    ) }
  >
    <CutoutImg
      originImg={ new URL('./assets/bed.webp', import.meta.url).href }
      cutoutImg={ new URL('./assets/bed-cutout.webp', import.meta.url).href }
      onChangeMask={ mask => console.log('Mask changed') }
      onChangePreviewImg={ img => console.log('Preview image changed') }
      onLoading={ loading => console.log('Loading state:', loading) }
    />

    <GithubSourceLink />
  </div>
}

export default Test
