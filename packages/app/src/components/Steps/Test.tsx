import { AlertCircle, Check, Copyright } from 'lucide-react'
import { Steps } from './Steps'

export default function Home() {
  return <div size-full overflow-auto>
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-4">
      <div className="max-w-2xl w-full space-y-8">
        <h1 className="text-center text-2xl font-bold">Steps Component Examples</h1>

        {/* Example 1: Horizontal Steps (like in the image) */ }
        <div>
          <h2 className="mb-4 text-lg font-semibold">Horizontal Steps</h2>
          <Steps
            items={ [
              {
                title: 'Step 1',
                status: 'finish',
              },
              {
                title: 'Step 2',
                status: 'finish',
              },
              {
                title: 'Step 3',
                status: 'process',
              },
              {
                title: 'Step 4',
                status: 'wait',
              },
            ] }
            expandable
          >
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Expanded content with details about the current step.</p>
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-black p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm">Task 1 completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-black p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm">Task 2 completed</span>
                </div>
              </div>
            </div>
          </Steps>
        </div>

        {/* Example 2: With Profile Images */ }
        <div>
          <h2 className="mb-4 text-lg font-semibold">With Profile Images</h2>
          <Steps
            items={ [
              {
                title: 'Profile 1',
                icon: (
                  <div className="h-full w-full overflow-hidden rounded-full">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MkIqX7vV4WPJsNLfcEB6kGGAP4uXxk.png"
                      alt="Profile 1"
                      width={ 32 }
                      height={ 32 }
                      className="h-full w-full object-cover"
                    />
                  </div>
                ),
                status: 'finish',
              },
              {
                title: 'Profile 2',
                icon: (
                  <div className="h-full w-full overflow-hidden rounded-full">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MkIqX7vV4WPJsNLfcEB6kGGAP4uXxk.png"
                      alt="Profile 2"
                      width={ 32 }
                      height={ 32 }
                      className="h-full w-full object-cover"
                    />
                  </div>
                ),
                status: 'process',
              },
              {
                title: 'Profile 3',
                icon: (
                  <div className="h-full w-full overflow-hidden rounded-full">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MkIqX7vV4WPJsNLfcEB6kGGAP4uXxk.png"
                      alt="Profile 3"
                      width={ 32 }
                      height={ 32 }
                      className="h-full w-full object-cover"
                    />
                  </div>
                ),
                status: 'wait',
              },
              {
                title: 'Profile 4',
                icon: (
                  <div className="h-full w-full overflow-hidden rounded-full">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MkIqX7vV4WPJsNLfcEB6kGGAP4uXxk.png"
                      alt="Profile 4"
                      width={ 32 }
                      height={ 32 }
                      className="h-full w-full object-cover"
                    />
                  </div>
                ),
                status: 'wait',
              },
            ] }
            expandable
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-MkIqX7vV4WPJsNLfcEB6kGGAP4uXxk.png"
                    alt="Profile 2 Detail"
                    width={ 40 }
                    height={ 40 }
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Profile 2</h3>
                  <p className="text-xs text-gray-500">Currently in progress</p>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Task completion</span>
                  <span className="font-medium">65%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={ { width: '65%' } }
                  ></div>
                </div>
              </div>
            </div>
          </Steps>
        </div>

        {/* Example 3: Small Size with Progress Dots */ }
        <div>
          <h2 className="mb-4 text-lg font-semibold">Small Size with Progress Dots</h2>
          <Steps
            className="w-96!"
            showLinkLine={ false }
            size={ 16 }
            expandDirection="up"
            items={ [
              {
                title: 'In Progress',
                description: 'This step has been completed',
                status: 'process',
                icon: <Copyright size={ 20 } />,
              },
              {
                title: 'Completed',
                description: 'This step has been completed too',
                status: 'finish',
              },
              {
                title: 'In Progress',
                description: 'This step is currently in progress',
                status: 'process',
              },
              {
                title: 'Waiting',
                description: 'This step is waiting to be started',
                status: 'wait',
              },
            ] }
            expandable
          />
        </div>

        {/* Example 4: Vertical Steps */ }
        <div>
          <h2 className="mb-4 text-lg font-semibold">Vertical Steps</h2>
          <Steps
            direction="vertical"
            items={ [
              {
                title: 'Completed',
                description: 'This step has been completed',
                status: 'finish',
              },
              {
                title: 'Completed',
                description: 'This step has been completed too',
                status: 'finish',
              },
              {
                title: 'In Progress',
                description: 'This step is currently in progress',
                status: 'process',
              },
              {
                title: 'Waiting',
                description: 'This step is waiting to be started',
                status: 'wait',
              },
              {
                title: 'Error',
                description: 'This step encountered an error',
                status: 'error',
                icon: <AlertCircle className="h-4 w-4" />,
              },
            ] }
            expandable
          />
        </div>

        {/* Example 5: Custom Progress Dot Function */ }
        <div>
          <h2 className="mb-4 text-lg font-semibold">Custom Progress Dot</h2>
          <Steps
            progressDot={ (dot, { status }) => {
              if (status === 'finish') {
                return <div className="h-3 w-3 rounded-full bg-green-500" />
              }
              if (status === 'process') {
                return <div className="h-3 w-3 animate-pulse rounded-full bg-blue-500" />
              }
              return <div className="h-3 w-3 border-2 border-gray-300 rounded-full" />
            } }
            items={ [
              {
                title: 'Login',
                description: 'Sign in to your account',
                status: 'finish',
              },
              {
                title: 'Verification',
                description: 'Verify your identity',
                status: 'process',
              },
              {
                title: 'Pay',
                description: 'Make payment',
                status: 'wait',
              },
              {
                title: 'Done',
                description: 'Order completed',
                status: 'wait',
              },
            ] }
            expandable
          />
        </div>

        {/* Example 6: Task List (like in the second image) */ }
        <div>
          <h2 className="mb-4 text-lg font-semibold">Task List with Steps</h2>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="mb-1 text-base font-medium">Task lists:</h3>
            <p className="mb-4 text-sm text-gray-500">50s</p>

            <div className="mb-6 space-y-4">
              { Array.from({ length: 4 }).map((_, i) => (
                <div key={ i } className="flex items-center gap-3">
                  <div className="rounded-full bg-black p-1.5">
                    <svg
                      className="h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M8 8H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="text-gray-500">Listing Copywrite</span>
                </div>
              )) }
            </div>

            <Steps
              items={ [
                {
                  icon: (
                    <div className="rounded-full bg-black p-1">
                      <svg
                        className="h-3 w-3 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V17"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M8 8H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  ),
                  status: 'process',
                },
                {
                  status: 'wait',
                },
                {
                  status: 'wait',
                },
                {
                  status: 'wait',
                },
                {
                  status: 'wait',
                },
              ] }
              expandable
            />
          </div>
        </div>
      </div>
    </main>
  </div>
}
