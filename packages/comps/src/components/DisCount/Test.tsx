import { Discount } from '.'
import { ThemeToggle } from '../ThemeToggle'

export default function DiscountDemo() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center from-gray-50 to-gray-100 bg-linear-to-br p-4 text-gray-800 dark:from-gray-900 dark:to-gray-800 sm:p-8 dark:text-gray-200">
      <div className="mx-auto max-w-4xl w-full">
        <ThemeToggle></ThemeToggle>
        <h1 className="my-6 from-blue-500 to-purple-600 bg-linear-to-r bg-clip-text text-center text-2xl text-transparent font-bold dark:from-blue-400 dark:to-purple-500 sm:text-3xl">
          折扣价格展示组件
        </h1>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 sm:grid-cols-2 sm:gap-6">
          <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-md transition-shadow duration-300 dark:border-gray-700 dark:bg-gray-800 hover:shadow-lg">
            <p className="mb-3 text-sm text-gray-500 font-medium dark:text-gray-400">基础折扣:</p>
            <Discount originalPrice={ 30 } discountedPrice={ 24.99 } />
          </div>

          <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-md transition-shadow duration-300 dark:border-gray-700 dark:bg-gray-800 hover:shadow-lg">
            <p className="mb-3 text-sm text-gray-500 font-medium dark:text-gray-400">仅原价:</p>
            <Discount originalPrice={ 30 } />
          </div>

          <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-md transition-shadow duration-300 dark:border-gray-700 dark:bg-gray-800 hover:shadow-lg">
            <p className="mb-3 text-sm text-gray-500 font-medium dark:text-gray-400">自定义货币 (€):</p>
            <Discount originalPrice={ 30 } discountedPrice={ 19.99 } currency="€" />
          </div>

          <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-md transition-shadow duration-300 dark:border-gray-700 dark:bg-gray-800 hover:shadow-lg">
            <p className="mb-3 text-sm text-gray-500 font-medium dark:text-gray-400">大幅折扣:</p>
            <Discount
              originalPrice={ 30 }
              discountedPrice={ 9.99 }
              originalPriceClassName="dark:text-gray-400"
              discountedPriceClassName="dark:text-gray-200"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
