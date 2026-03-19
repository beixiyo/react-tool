'use client'

import { Bell, Home, Menu, Search, Settings, User } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { Card } from '../Card/Card'
import { Input } from '../Input/Input'
import { Tooltip } from '../Tooltip'
import { TourGuide } from '../TourGuide'

export default function TestPage() {
  const [isTourOpen, setIsTourOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [accentColor, setAccentColor] = useState<string | undefined>('rgb(var(--brand) / 1)')

  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev].slice(0, 10))
  }

  const steps = [
    {
      title: 'Welcome to the Tour!',
      content: (
        <div>
          <p>This is a customizable tour guide component that helps users navigate through your application.</p>
          <p className="mt-2 text-text2">Click "Next" to continue the tour.</p>
        </div>
      ),
      position: 'center' as const,
    },
    {
      title: 'Navigation Menu',
      content: 'This is the main navigation menu. You can access different sections of the app from here.',
      selector: '#navbar',
      position: 'bottom' as const,
    },
    {
      title: 'Search Feature',
      content: 'Use the search bar to quickly find what you need.',
      selector: '#search',
      position: 'bottom-right' as const,
    },
    {
      title: 'User Profile',
      content: 'Access your profile settings and preferences here.',
      selector: '#profile',
      position: 'left-top' as const,
    },
    {
      title: 'Notifications',
      content: 'Check your latest notifications and updates.',
      selector: '#notifications',
      position: 'left-bottom' as const,
    },
    {
      title: 'Settings',
      content: 'Customize your application settings and preferences.',
      selector: '#settings',
      position: 'top-right' as const,
    },
    {
      title: 'Main Content',
      content: 'This is where the main content of the application is displayed.',
      selector: '#main-content',
      position: 'top' as const,
    },
    {
      title: 'Tour Complete!',
      content: (
        <div>
          <p>You've completed the tour! Now you know how to navigate through the application.</p>
          <p className="mt-2 text-text2">Click "Done" to close this tour.</p>
        </div>
      ),
      position: 'center' as const,
    },
  ]

  const handleStepChange = (stepIndex: number) => {
    setCurrentStep(stepIndex)
    addLog(`Step changed to ${stepIndex + 1}`)
  }

  const handleTourComplete = () => {
    setIsTourOpen(false)
    addLog('Tour completed')
  }

  const handleTourSkip = () => {
    setIsTourOpen(false)
    addLog('Tour skipped')
  }

  const startTourFromBeginning = (color?: string) => {
    setCurrentStep(0)
    setIsTourOpen(true)
    setAccentColor(color)
    addLog('Tour started from beginning')
  }

  const startTourFromStep = (step: number) => {
    setCurrentStep(step)
    setIsTourOpen(true)
    addLog(`Tour started from step ${step + 1}`)
  }

  return (
    <div className="h-screen overflow-auto bg-background2">
      {/* Header */}
      <header id="navbar" className="bg-background shadow-2xs">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center">
              <Menu className="size-5 text-text" />
              <span className="ml-2 text-lg font-medium text-text">Tour Demo</span>

              <nav className="ml-8 flex items-center gap-1">
                <Button variant="ghost" size="sm" leftIcon={ <Home className="size-4" /> }>
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm">Products</Button>
                <Button variant="ghost" size="sm">Analytics</Button>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div id="search">
                <Input
                  size="sm"
                  placeholder="Search"
                  prefix={ <Search className="size-4 text-text3" /> }
                  className="w-48"
                />
              </div>

              <div id="notifications">
                <Tooltip content="Notifications">
                  <Badge count={ 3 } size="sm">
                    <Button variant="ghost" size="sm" iconOnly>
                      <Bell className="size-5" />
                    </Button>
                  </Badge>
                </Tooltip>
              </div>

              <div id="settings">
                <Tooltip content="Settings">
                  <Button variant="ghost" size="sm" iconOnly>
                    <Settings className="size-5" />
                  </Button>
                </Tooltip>
              </div>

              <div id="profile">
                <Tooltip content="Profile">
                  <Button variant="ghost" size="sm" iconOnly>
                    <User className="size-5" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <div className="mx-auto max-w-7xl py-6 px-4 lg:px-8 sm:px-6">
          <div
            id="main-content"
            className="min-h-[400px] border-2 border-border rounded-2xl border-dashed bg-background p-6"
          >
            <h1 className="mb-6 text-2xl text-text font-semibold">Tour Guide Component Demo</h1>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card title="Tour Controls" shadow="sm">
                <div className="space-y-4">
                  <Button
                    variant="primary"
                    block
                    onClick={ () => startTourFromBeginning('rgb(var(--brand) / 1)') }
                  >
                    Start Tour
                  </Button>

                  <div>
                    <p className="mb-2 text-sm text-text2">Start from specific step:</p>
                    <div className="flex flex-wrap gap-2">
                      { steps.map((_, index) => (
                        <Button
                          key={ index }
                          variant="secondary"
                          size="sm"
                          onClick={ () => startTourFromStep(index) }
                        >
                          Step
                          {' '}
                          { index + 1 }
                        </Button>
                      )) }
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm text-text2">Customize:</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={ () => startTourFromBeginning() }
                      >
                        Default
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={ () => startTourFromBeginning('rgb(var(--systemGreen) / 1)') }
                      >
                        Green Theme
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Event Log" shadow="sm">
                <div className="space-y-3">
                  <Button
                    variant="secondary"
                    block
                    onClick={ () => setIsModalOpen(true) }
                  >
                    View Full Log (
                    { logs.length }
                    )
                  </Button>

                  <div className="space-y-1">
                    { logs.slice(0, 3).map((log, index) => (
                      <div key={ index } className="text-sm text-text2 truncate">
                        { log }
                      </div>
                    )) }
                    { logs.length === 0 && (
                      <p className="text-sm text-text3 italic">No events yet.</p>
                    ) }
                  </div>
                </div>
              </Card>
            </div>

            <Card title="Component Features" shadow="sm" className="mt-6">
              <ul className="list-disc pl-5 text-text text-sm space-y-1.5">
                <li>Customizable steps with titles and content</li>
                <li>Element highlighting with smooth animations</li>
                <li>Flexible positioning (top, right, bottom, left, center)</li>
                <li>Event callbacks for step changes, completion, and skipping</li>
                <li>Keyboard navigation (arrow keys and escape)</li>
                <li>Customizable colors and animations</li>
                <li>Responsive design that works on all screen sizes</li>
                <li>Ability to jump to specific steps</li>
              </ul>
            </Card>
          </div>
        </div>
      </main>

      {/* Tour Guide */}
      <TourGuide
        steps={ steps }
        isOpen={ isTourOpen }
        initialStep={ currentStep }
        onStepChange={ handleStepChange }
        onComplete={ handleTourComplete }
        onSkip={ handleTourSkip }
        accentColor={ accentColor }
        backdropColor="rgb(var(--text) / 0.7)"
        animationDuration={ 400 }
      />
    </div>
  )
}
