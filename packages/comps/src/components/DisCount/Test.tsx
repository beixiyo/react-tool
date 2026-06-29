import { Discount } from '.'
import { Card } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'

function DiscountDemo() {
  return (
    <div className="min-h-screen w-full bg-background p-4 text-text sm:p-8">
      <div className="mx-auto max-w-4xl w-full">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">折扣价格展示组件</h1>
            <p className="mt-1 text-sm text-text2">展示原价、折扣价与折扣力度</p>
          </div>
          <ThemeToggle />
        </header>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4 sm:grid-cols-2 sm:gap-6">
          <Card className="p-5">
            <p className="mb-3 text-sm text-text2 font-medium">基础折扣:</p>
            <Discount originalPrice={ 30 } discountedPrice={ 24.99 } />
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-sm text-text2 font-medium">仅原价:</p>
            <Discount originalPrice={ 30 } />
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-sm text-text2 font-medium">自定义货币 (€):</p>
            <Discount originalPrice={ 30 } discountedPrice={ 19.99 } currency="€" />
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-sm text-text2 font-medium">大幅折扣:</p>
            <Discount originalPrice={ 30 } discountedPrice={ 9.99 } />
          </Card>
        </div>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default DiscountDemo
