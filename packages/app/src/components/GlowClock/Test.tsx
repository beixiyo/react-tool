'use client'

import type { GlowClockProps } from '.'
import { useState } from 'react'
import { GithubSourceLink } from '@/components/GithubSourceLink'
import { GlowClock } from '.'

function Test() {
  const [settings, setSettings] = useState<GlowClockProps>({
    radius: 70,
    strokeWidth: 6,
    gradientStartAngle: -64,
    gradientEndAngle: -25,
    hourHandLength: 0.5,
    minuteHandLength: 0.7,
    glowIntensity: 0,
    glowColor: '#00ff00',
  })

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-black p-8">
      <GlowClock { ...settings } />

      <div className="max-w-md w-full text-green-400 space-y-4">
        <div>
          <label className="block text-sm">
            Radius:
            { ' ' }
            { settings.radius }
          </label>
          <input
            type="range"
            min="50"
            max="200"
            value={ settings.radius }
            onChange={ e => setSettings(s => ({ ...s, radius: Number(e.target.value) })) }
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm">
            Stroke Width:
            { ' ' }
            { settings.strokeWidth }
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={ settings.strokeWidth }
            onChange={ e => setSettings(s => ({ ...s, strokeWidth: Number(e.target.value) })) }
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm">
            Gradient Start Angle:
            { ' ' }
            { settings.gradientStartAngle }
          </label>
          <input
            type="range"
            min="-180"
            max="180"
            value={ settings.gradientStartAngle }
            onChange={ e => setSettings(s => ({ ...s, gradientStartAngle: Number(e.target.value) })) }
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm">
            Gradient End Angle:
            { ' ' }
            { settings.gradientEndAngle }
          </label>
          <input
            type="range"
            min="-180"
            max="180"
            value={ settings.gradientEndAngle }
            onChange={ e => setSettings(s => ({ ...s, gradientEndAngle: Number(e.target.value) })) }
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm">
            Hour Hand Length:
            { ' ' }
            { settings.hourHandLength }
          </label>
          <input
            type="range"
            min="0.2"
            max="0.8"
            step="0.1"
            value={ settings.hourHandLength }
            onChange={ e => setSettings(s => ({ ...s, hourHandLength: Number(e.target.value) })) }
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm">
            Minute Hand Length:
            { ' ' }
            { settings.minuteHandLength }
          </label>
          <input
            type="range"
            min="0.2"
            max="0.9"
            step="0.1"
            value={ settings.minuteHandLength }
            onChange={ e => setSettings(s => ({ ...s, minuteHandLength: Number(e.target.value) })) }
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm">
            Glow Intensity:
            { ' ' }
            { settings.glowIntensity }
          </label>
          <input
            type="range"
            min="0"
            max="0.3"
            step="0.01"
            value={ settings.glowIntensity }
            onChange={ e => setSettings(s => ({ ...s, glowIntensity: Number(e.target.value) })) }
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm">
            Glow Color:
            { ' ' }
            { settings.glowColor }
          </label>
          <input
            type="color"
            value={ settings.glowColor }
            onChange={ e => setSettings(s => ({ ...s, glowColor: e.target.value })) }
            className="h-8 w-full bg-transparent"
          />
        </div>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default Test
