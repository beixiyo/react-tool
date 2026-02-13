'use client'

import { Bell, Home, Menu, Search, Settings, User } from 'lucide-react'
import { useState } from 'react'
import { TourGuide } from '../TourGuide'

export default function TestPage() {
  const [isTourOpen, setIsTourOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [accentColor, setAccentColor] = useState<string | undefined>('rgb(var(--brand) / 1)')

  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev].slice(0, 5))
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
      {/* Header */ }
      <header id="navbar" className="bg-background shadow-xs">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 sm:px-6">
          <div className="h-16 flex justify-between">
            <div className="flex">
              <div className="flex shrink-0 items-center">
                <Menu className="h-6 w-6 text-text" />
                <span className="ml-2 text-lg font-medium text-text">Tour Demo</span>
              </div>
              <nav className="ml-6 flex space-x-8">
                <a
                  href="#"
                  className="inline-flex items-center border-b-2 border-brand px-1 pt-1 text-sm font-medium text-text"
                >
                  <Home className="mr-1 h-5 w-5" />
                  Dashboard
                </a>
                <a
                  href="#"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm text-text2 font-medium hover:border-border hover:text-text"
                >
                  Products
                </a>
                <a
                  href="#"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm text-text2 font-medium hover:border-border hover:text-text"
                >
                  Analytics
                </a>
              </nav>
            </div>
            <div className="flex items-center">
              <div id="search" className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-text3" />
                </div>
                <input
                  type="text"
                  className="block w-full border border-border rounded-md bg-background py-2 pl-10 pr-3 leading-5 focus:border-brand sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-brand text-text placeholder:text-text3 focus:placeholder:text-text4"
                  placeholder="Search"
                />
              </div>
              <div id="notifications" className="relative ml-4">
                <button className="rounded-full p-1 text-text2 hover:text-text focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-brand">
                  <Bell className="h-6 w-6" />
                </button>
              </div>
              <div id="settings" className="relative ml-4">
                <button className="rounded-full p-1 text-text2 hover:text-text focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-brand">
                  <Settings className="h-6 w-6" />
                </button>
              </div>
              <div id="profile" className="relative ml-4">
                <button className="rounded-full p-1 text-text2 hover:text-text focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-brand">
                  <User className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */ }
      <main>
        <div className="mx-auto max-w-7xl py-6 lg:px-8 sm:px-6">
          <div className="px-4 py-6 sm:px-0">
            <div
              id="main-content"
              className="min-h-[400px] border-2 border-border rounded-lg border-dashed bg-background p-6"
            >
              <h1 className="mb-6 text-2xl text-text font-semibold">Tour Guide Component Demo</h1>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="border border-border rounded-lg bg-background p-6 shadow-xs">
                  <h2 className="mb-4 text-lg font-medium">Tour Controls</h2>
                  <div className="space-y-4">
                    <button
                      onClick={ () => startTourFromBeginning('rgb(var(--brand) / 1)') }
                      className="w-full rounded-md bg-brand px-4 py-2 text-white transition-colors hover:opacity-90"
                    >
                      Start Tour
                    </button>

                    <div>
                      <p className="mb-2 text-sm text-text2">Start from specific step:</p>
                      <div className="flex flex-wrap gap-2">
                        { steps.map((_, index) => (
                          <button
                            key={ index }
                            onClick={ () => startTourFromStep(index) }
                            className="rounded-md bg-background2 px-3 py-1 text-sm text-text transition-colors hover:bg-background3"
                          >
                            Step
                            { ' ' }
                            { index + 1 }
                          </button>
                        )) }
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-sm text-text2">Customize:</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={ () => startTourFromBeginning() }
                          className="rounded-md bg-background2 px-3 py-1 text-sm text-text transition-colors hover:bg-background3"
                        >
                          Default
                        </button>
                        <button
                          onClick={ () => startTourFromBeginning('rgb(var(--systemGreen) / 1)') }
                          className="rounded-md bg-systemGreen px-3 py-1 text-sm text-white transition-colors hover:opacity-90"
                        >
                          Green Theme
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-border rounded-lg bg-background p-6 shadow-xs">
                  <h2 className="mb-4 text-lg font-medium">Event Log</h2>
                  <div className="h-[200px] overflow-y-auto border border-border rounded-md bg-background2 p-3">
                    { logs.length > 0
                      ? (
                          <ul className="space-y-2">
                            { logs.map((log, index) => (
                              <li key={ index } className="border-b border-border2 pb-1 text-sm text-text">
                                { log }
                              </li>
                            )) }
                          </ul>
                        )
                      : (
                          <p className="text-sm text-text3 italic">No events yet. Start the tour to see events.</p>
                        ) }
                  </div>
                </div>
              </div>

              <div className="mt-8 border border-border rounded-lg bg-background p-6 shadow-xs">
                <h2 className="mb-4 text-lg font-medium">Component Features</h2>
                <ul className="list-disc pl-5 text-text space-y-2">
                  <li>Customizable steps with titles and content</li>
                  <li>Element highlighting with smooth animations</li>
                  <li>Flexible positioning (top, right, bottom, left, center)</li>
                  <li>Event callbacks for step changes, completion, and skipping</li>
                  <li>Keyboard navigation (arrow keys and escape)</li>
                  <li>Customizable colors and animations</li>
                  <li>Responsive design that works on all screen sizes</li>
                  <li>Ability to jump to specific steps</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Tour Guide */ }
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
