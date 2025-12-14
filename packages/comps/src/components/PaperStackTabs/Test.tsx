import { PaperStackTabs } from "./PaperStackTabs"

export default function Home() {
  const tabItems = [
    {
      id: "features",
      title: "Features",
      content: (
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Amazing Features</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our platform comes with a comprehensive set of features designed to help you succeed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-accent rounded-lg">
              <h3 className="font-semibold mb-2">⚡ Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">Optimized for performance with minimal bundle size</p>
            </div>
            <div className="p-4 bg-accent rounded-lg">
              <h3 className="font-semibold mb-2">🎨 Customizable</h3>
              <p className="text-sm text-muted-foreground">Fully themeable with Tailwind CSS</p>
            </div>
            <div className="p-4 bg-accent rounded-lg">
              <h3 className="font-semibold mb-2">♿ Accessible</h3>
              <p className="text-sm text-muted-foreground">Built with accessibility in mind from the ground up</p>
            </div>
            <div className="p-4 bg-accent rounded-lg">
              <h3 className="font-semibold mb-2">📱 Responsive</h3>
              <p className="text-sm text-muted-foreground">Works beautifully on all device sizes</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "overview",
      title: "Overview",
      content: <Overview />,
    },
    {
      id: "pricing",
      title: "Pricing",
      content: (
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Simple Pricing</h2>
          <p className="text-muted-foreground leading-relaxed">
            Choose the plan that works best for you. No hidden fees, cancel anytime.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-6 border border-border rounded-lg">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <div className="text-3xl font-bold mb-4">
                $9<span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li>✓ 5 Projects</li>
                <li>✓ Basic Support</li>
                <li>✓ 1GB Storage</li>
              </ul>
            </div>
            <div className="p-6 border-2 border-primary rounded-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                Popular
              </div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-4">
                $29<span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li>✓ Unlimited Projects</li>
                <li>✓ Priority Support</li>
                <li>✓ 50GB Storage</li>
              </ul>
            </div>
            <div className="p-6 border border-border rounded-lg">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <div className="text-3xl font-bold mb-4">Custom</div>
              <ul className="space-y-2 text-sm">
                <li>✓ Everything in Pro</li>
                <li>✓ Dedicated Support</li>
                <li>✓ Unlimited Storage</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      content: (
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Get in Touch</h2>
          <p className="text-muted-foreground leading-relaxed">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
          <div className="mt-6 space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-input rounded-lg bg-background"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-input rounded-lg bg-background"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                rows={ 4 }
                className="w-full px-4 py-2 border border-input rounded-lg bg-background resize-none"
                placeholder="How can we help?"
              />
            </div>
            <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Send Message
            </button>
          </div>
        </div>
      ),
    },
  ]

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4 text-balance">Paper Stack Tabs</h1>
        <p className="text-xl text-muted-foreground text-balance">
          An elegant tab component with physics-based animations
        </p>
      </div>

      <PaperStackTabs items={ tabItems } />
    </main>
  )
}


function Overview() {
  console.log('Overview render')
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold">Project Overview</h2>
      <p className="text-muted-foreground leading-relaxed">
        This is a demonstration of the Paper Stack Tabs component. Watch as each tab flies in from the right like a
        new piece of paper landing on a desk, while the previous content remains visible underneath with a subtle
        tilt.
      </p>
      <div className="mt-6 p-4 bg-secondary rounded-lg">
        <h3 className="font-semibold mb-2">Key Features:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Smooth fly-in animation from the right</li>
          <li>Spring physics for natural movement</li>
          <li>Previous tab visible underneath with rotation</li>
          <li>Responsive and accessible design</li>
        </ul>
      </div>
    </div>
  )
}
