import { Book, Camera, Coffee, Heart, Moon, Music, Palette, Sparkles, Star, Sun } from 'lucide-react'
import { SeamlessScroll } from '.'
import { ThemeToggle } from '../ThemeToggle'

export default function Test() {
  return (
    <div className="p-4 text-center">
      <ThemeToggle className="shadow-md" />
      <h1 className="mb-2 text-4xl font-semibold">
        Seamless Scroll Demo
      </h1>
      <p className="mb-12 text-center">
        A smooth, natural scrolling experience inspired by Apple's design principles
      </p>

      <div className="flex flex-col items-center justify-center gap-16">
        <SeamlessScroll
          speed={ 40 }
          className="mx-auto w-2xl border border-gray-300 rounded-xl dark:border-gray-600"
          pauseOnHover
          gap={ 16 }
        >
          <HorizontalCard icon={ Sparkles } text="Magic happens" />
          <HorizontalCard icon={ Star } text="Favorite moments" />
          <HorizontalCard icon={ Heart } text="Love this design" />
          <HorizontalCard icon={ Music } text="Smooth rhythm" />
          <HorizontalCard icon={ Coffee } text="Stay focused" />
        </SeamlessScroll>

        <SeamlessScroll
          speed={ 30 }
          direction="up"
          className="mx-auto h-[300px] border border-gray-300 rounded-xl dark:border-gray-600"
          pauseOnHover
          gap={ 16 }
        >
          <VerticalCard icon={ Palette } text="Creative design" />
          <VerticalCard icon={ Camera } text="Capture moments" />
          <VerticalCard icon={ Book } text="Read stories" />
          <VerticalCard icon={ Sun } text="Bright days" />
          <VerticalCard icon={ Moon } text="Peaceful nights" />
        </SeamlessScroll>
      </div>
    </div>
  )
}

function HorizontalCard({ icon: Icon, text }: { icon: React.ElementType, text: string }) {
  return <div className="flex items-center gap-3 border border-gray-100 rounded-xl bg-slate-200 px-6 py-4 transition-colors hover:border-indigo-200">
    <Icon className="h-5 w-5 text-indigo-600" />
    <span className="text-gray-700">{ text }</span>
  </div>
}

function VerticalCard({ icon: Icon, text }: { icon: React.ElementType, text: string }) {
  return <div className="w-64 flex items-center gap-3 border border-gray-100 rounded-xl bg-slate-200 px-6 py-4 transition-colors hover:border-rose-200">
    <Icon className="h-5 w-5 text-rose-600" />
    <span className="text-gray-700">{ text }</span>
  </div>
}
