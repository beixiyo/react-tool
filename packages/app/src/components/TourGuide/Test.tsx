'use client'

import { Bell, Home, Menu, Search, Settings, User } from 'lucide-react'
import { useState } from 'react'
import { TourGuide } from '@/components/TourGuide'

export default function TestPage() {
  const [isTourOpen, setIsTourOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [accentColor, setAccentColor] = useState<string | undefined>('#4f46e5')

  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev].slice(0, 5))
  }

  const steps = [
    {
      title: 'Welcome to the Tour!',
      content: (
        <div>
          <p>This is a customizable tour guide component that helps users navigate through your application.</p>
          <p className="mt-2 text-gray-600">Click "Next" to continue the tour.</p>
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
          <p className="mt-2 text-gray-600">Click "Done" to close this tour.</p>
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
    <div className="h-screen overflow-auto bg-gray-50">
      {/* Header */ }
      <header id="navbar" className="bg-white shadow-xs">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 sm:px-6">
          <div className="h-16 flex justify-between">
            <div className="flex">
              <div className="flex shrink-0 items-center">
                <Menu className="h-6 w-6 text-gray-700" />
                <span className="ml-2 text-lg font-medium">Tour Demo</span>
              </div>
              <nav className="ml-6 flex space-x-8">
                <a
                  href="#"
                  className="inline-flex items-center border-b-2 border-indigo-500 px-1 pt-1 text-sm font-medium"
                >
                  <Home className="mr-1 h-5 w-5" />
                  Dashboard
                </a>
                <a
                  href="#"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm text-gray-500 font-medium hover:border-gray-300 hover:text-gray-700"
                >
                  Products
                </a>
                <a
                  href="#"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm text-gray-500 font-medium hover:border-gray-300 hover:text-gray-700"
                >
                  Analytics
                </a>
              </nav>
            </div>
            <div className="flex items-center">
              <div id="search" className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full border border-gray-300 rounded-md bg-white py-2 pl-10 pr-3 leading-5 focus:border-indigo-500 sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-gray-500 focus:placeholder-gray-400"
                  placeholder="Search"
                />
              </div>
              <div id="notifications" className="relative ml-4">
                <button className="rounded-full p-1 text-gray-600 hover:text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <Bell className="h-6 w-6" />
                </button>
              </div>
              <div id="settings" className="relative ml-4">
                <button className="rounded-full p-1 text-gray-600 hover:text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <Settings className="h-6 w-6" />
                </button>
              </div>
              <div id="profile" className="relative ml-4">
                <button className="rounded-full p-1 text-gray-600 hover:text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
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
              className="min-h-[400px] border-2 border-gray-300 rounded-lg border-dashed bg-white p-6"
            >
              <h1 className="mb-6 text-2xl text-gray-900 font-semibold">Tour Guide Component Demo</h1>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="border border-gray-200 rounded-lg bg-white p-6 shadow-xs">
                  <h2 className="mb-4 text-lg font-medium">Tour Controls</h2>
                  <div className="space-y-4">
                    <button
                      onClick={ () => startTourFromBeginning('#4f46e5') }
                      className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
                    >
                      Start Tour
                    </button>

                    <div>
                      <p className="mb-2 text-sm text-gray-600">Start from specific step:</p>
                      <div className="flex flex-wrap gap-2">
                        { steps.map((_, index) => (
                          <button
                            key={ index }
                            onClick={ () => startTourFromStep(index) }
                            className="rounded-md bg-gray-200 px-3 py-1 text-sm text-gray-800 transition-colors hover:bg-gray-300"
                          >
                            Step
                            { ' ' }
                            { index + 1 }
                          </button>
                        )) }
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-sm text-gray-600">Customize:</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={ () => startTourFromBeginning() }
                          className="rounded-md bg-gray-200 px-3 py-1 text-sm text-gray-800 transition-colors hover:bg-gray-300"
                        >
                          Default
                        </button>
                        <button
                          onClick={ () => startTourFromBeginning('#059669') }
                          className="rounded-md bg-emerald-600 px-3 py-1 text-sm text-white transition-colors hover:bg-emerald-700"
                        >
                          Green Theme
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg bg-white p-6 shadow-xs">
                  <h2 className="mb-4 text-lg font-medium">Event Log</h2>
                  <div className="h-[200px] overflow-y-auto border border-gray-200 rounded-md bg-gray-50 p-3">
                    { logs.length > 0
                      ? (
                          <ul className="space-y-2">
                            { logs.map((log, index) => (
                              <li key={ index } className="border-b border-gray-100 pb-1 text-sm text-gray-700">
                                { log }
                              </li>
                            )) }
                          </ul>
                        )
                      : (
                          <p className="text-sm text-gray-500 italic">No events yet. Start the tour to see events.</p>
                        ) }
                  </div>
                </div>
              </div>

              <div className="mt-8 border border-gray-200 rounded-lg bg-white p-6 shadow-xs">
                <h2 className="mb-4 text-lg font-medium">Component Features</h2>
                <ul className="list-disc pl-5 text-gray-700 space-y-2">
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
        backdropColor="rgba(0, 0, 0, 0.7)"
        animationDuration={ 400 }
      />
    </div>
  )
}
