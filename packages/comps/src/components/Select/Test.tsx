'use client'

import type { Option } from './types'
import { Cat, Dog, Fish, Globe, Mail, PawPrint, Phone, User } from 'lucide-react'
import { useState } from 'react'
import { ThemeToggle } from '../ThemeToggle'
import { Select } from './Select'

const options: Option[] = [
  { value: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
  { value: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
  { value: 'phone', label: 'Phone', icon: <Phone className="h-4 w-4" />, disabled: true },
  { value: 'website', label: 'Website', icon: <Globe className="h-4 w-4" /> },
]

const cascaderOptions: Option[] = [
  {
    value: 'pets',
    label: 'Pets',
    icon: <PawPrint className="h-4 w-4" />,
    children: [
      { value: 'dog', label: 'Dog', icon: <Dog className="h-4 w-4" /> },
      { value: 'cat', label: 'Cat', icon: <Cat className="h-4 w-4" /> },
      {
        value: 'fish',
        label: 'Fish',
        icon: <Fish className="h-4 w-4" />,
        children: [
          { value: 'goldfish', label: 'Goldfish' },
          { value: 'guppy', label: 'Guppy' },
        ],
      },
    ],
  },
  {
    value: 'profile',
    label: 'Profile',
    icon: <User className="h-4 w-4" />,
  },
]

function App() {
  const [singleValue, setSingleValue] = useState<string>('')
  const [multiValue, setMultiValue] = useState<string[]>([])
  const [cascaderValue, setCascaderValue] = useState<string>('goldfish')

  return (
    <div className="min-h-screen bg-background p-8 text-text">
      <div className="mx-auto max-w-md space-y-8">
        <ThemeToggle />

        <div className="rounded-lg bg-background p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">Cascading Select</h2>
          <Select
            options={ cascaderOptions }
            value={ cascaderValue }
            onChange={ value => setCascaderValue(value as string) }
            placeholder="Select a pet"
          />
        </div>

        <div className="rounded-lg bg-background p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">Single Select</h2>
          <Select
            options={ options }
            value={ singleValue }
            onChange={ value => setSingleValue(value as string) }
            placeholder="Select an option"
            placeholderIcon={ <>
              <Mail className="h-4 w-4" />
              <User className="h-4 w-4" />
              <Phone className="h-4 w-4" />
              <Globe className="h-4 w-4" />
            </> }
            searchable={ false }
            showEmpty={ false }
          />
        </div>

        <div className="rounded-lg bg-background p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">Multiple Select</h2>
          <Select
            options={ options }
            value={ multiValue }
            onChange={ value => setMultiValue(value as string[]) }
            placeholder="Select options"
            multiple
            maxSelect={ 3 }
            searchable
          />
        </div>

        <div className="rounded-lg bg-background p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">Disabled Select</h2>
          <Select
            options={ options }
            placeholder="Select an option"
            disabled
          />
        </div>

        <div className="rounded-lg bg-background p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-text">Loading State</h2>
          <Select
            options={ options }
            placeholder="Select an option"
            loading
          />
        </div>
      </div>
    </div>
  )
}

export default App
