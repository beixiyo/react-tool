'use client'

import type { SidebarProps } from '.'
import { useMemo, useState } from 'react'
import { Sidebar } from '.'
import { ThemeToggle } from '../ThemeToggle'
import { SidebarTestData } from './test.data'

export default function Home() {
  const [items, setItems] = useState(SidebarTestData)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const hasMore = useMemo(
    () => items.length < 100,
    [items],
  )

  async function loadMore() {
    const { promise, resolve } = Promise.withResolvers<void>()
    setTimeout(() => {
      setItems(prev => [
        ...prev,
        {
          ...SidebarTestData[0],
          id: crypto.randomUUID(),
        },
      ])
      resolve()
    }, 200)

    return promise
  }

  const handleItemClick = (id: string) => {
    setSelectedItem(id)
    console.log(`Item clicked: ${id}`)
  }

  const handleAddClick = () => {
    console.log('Add button clicked')
    // Add a new item to demonstrate scrolling
    const newItem: SidebarProps['data'][0] = {
      id: `new-${Date.now()}`,
      img: '/placeholder.svg?height=100&width=100',
      title: `New product ${items.length + 1}`,
      subtitle: 'Product Discussion',
      timestamp: 'Just now',
    }

    setItems([newItem, ...items])
  }

  return (
    <main className="h-screen flex flex-col items-center justify-center overflow-auto">

      <div className="mb-8 text-center">
        <ThemeToggle />
        <h1 className="mt-6 text-2xl font-bold">Hover Expandable Sidebar</h1>
        <p className="text-mutedForeground">Hover over the sidebar to expand it</p>
      </div>

      <div className="flex gap-8">
        <div className="flex flex-col gap-4">
          <Sidebar
            data={ items }
            onItemClick={ handleItemClick }
            onAddClick={ handleAddClick }
            loadMore={ loadMore }
            hasMore={ hasMore }
            className="h-96"
          />
        </div>

        <div className="h-[500px] w-[500px] flex flex-col items-center justify-center border border-border rounded-lg p-6 shadow-lg">
          <div className="text-center">
            { selectedItem
              ? (
                  <div>
                    <h2 className="text-xl font-medium">
                      Selected:
                      { ' ' }
                      { items.find(item => item.id === selectedItem)?.title }
                    </h2>
                    <p className="mt-2 text-mutedForeground">This is where your main content would go</p>
                  </div>
                )
              : (
                  <div>
                    <h2 className="text-xl font-medium">No item selected</h2>
                    <p className="mt-2 text-mutedForeground">Hover over the sidebar and click an item</p>
                  </div>
                ) }
          </div>
        </div>
      </div>
    </main>
  )
}
