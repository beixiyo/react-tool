import { motion } from 'framer-motion'
import { PlayCircle } from 'lucide-react'
import React, { memo, useEffect, useRef } from 'react'
import { cn } from 'utils'

const Player: React.FC<PlayerProps> = ({
  src,
  seekTime,
  onMetadataLoaded,
  className,
  autoPlay = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video && src) {
      if (video.src !== src) {
        video.src = src
        video.load() // Important to load the new source
      }
    }
    else if (video && !src) {
      video.removeAttribute('src')
      video.load()
    }
  }, [src])

  useEffect(() => {
    const video = videoRef.current
    if (video && seekTime !== undefined && Number.isFinite(seekTime)) {
      // Only seek if the difference is noticeable to avoid jitter
      if (Math.abs(video.currentTime - seekTime) > 0.15) {
        video.currentTime = seekTime
      }
    }
  }, [seekTime])

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      onMetadataLoaded?.(videoRef.current.duration)
      if (autoPlay) {
        videoRef.current.play().catch(err => console.warn('Autoplay prevented:', err))
      }
    }
  }

  return (
    <motion.div
      layout
      className={ cn('relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl', className) }
    >
      { src
        ? (
            <video
              ref={ videoRef }
              className="h-full w-full object-contain"
              controls
              onLoadedMetadata={ handleLoadedMetadata }
              // poster="placeholder_for_poster_image.jpg" // Optional poster
            />
          )
        : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-gray-200 text-gray-500 dark:bg-gray-800">
              <PlayCircle size={ 64 } className="mb-4 opacity-30" />
              <p className="text-lg">No video loaded</p>
              <p className="text-sm">Upload a video and select it from the list.</p>
            </div>
          ) }
    </motion.div>
  )
}

export default memo(Player)

export type PlayerProps = {
  /**
   * The Blob URL or path to the video source.
   */
  src?: string | null
  /**
   * The time (in seconds) to seek the video to.
   */
  seekTime?: number
  /**
   * Callback when video metadata (like duration) is loaded.
   * Provides the duration in seconds.
   */
  onMetadataLoaded?: (duration: number) => void
  /**
   * Additional CSS classes for the container.
   */
  className?: string
  /**
   * Autoplay the video when a new src is provided.
   * @default false
   */
  autoPlay?: boolean
}
