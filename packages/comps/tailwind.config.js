// @ts-check
import Config from '../../tailwind.config.js'

/** @type {import('tailwindcss').Config} */
export default {
  ...Config,
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
}
