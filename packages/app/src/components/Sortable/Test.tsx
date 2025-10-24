'use client'

import { useState } from 'react'
import { Sortable } from '.'

const initialItems = [
  { id: 'item-1', content: '🍎 Apple' },
  { id: 'item-2', content: '🍌 Banana' },
  { id: 'item-3', content: '🍇 Grape' },
  { id: 'item-4', content: '🍊 Orange' },
  { id: 'item-5', content: '🍓 Strawberry' },
]

function App() {
  const [items, setItems] = useState(initialItems)

  return (
    <div className="h-screen overflow-auto bg-background">
      <div className="mx-auto flex flex-col items-center p-8 container">
        <h1 className="mb-8 text-3xl text-textPrimary font-bold">Draggable List with Framer Motion</h1>
        <Sortable
          items={ items }
          setItems={ setItems }
          className={ [
            'max-w-md w-[300px] rounded-xl bg-backgroundSubtle p-4 shadow-lg border border-border',
          ] }
          itemClassName={ [
            'p-4 my-2 rounded-lg shadow-md cursor-grab active:cursor-grabbing',
            'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
            'hover:from-blue-700 hover:to-purple-700',
            'focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
          ] }
        >
          { item => item.content }
        </Sortable>

        <div className="mt-8 w-[300px] rounded-sm bg-background p-4 shadow-sm border border-border">
          <h2 className="mb-2 text-xl text-textPrimary font-semibold">Current Order:</h2>
          <ol className="list-decimal list-inside text-textSecondary">
            { items.map(item => (
              <li key={ item.id }>{ item.content }</li>
            )) }
          </ol>
        </div>
      </div>
    </div>
  )
}

export default App
