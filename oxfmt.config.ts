import { defineConfig } from 'oxfmt'

export default defineConfig({
  printWidth: 160,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  jsxSingleQuote: false,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  arrowParens: 'always',
  bracketSameLine: false,
  bracketSpacing: true,
  endOfLine: 'lf',
  sortTailwindcss: {
    stylesheet: './packages/styles/css/tailwind.css',
    functions: ['cn', 'cva', 'clsx', 'classnames'],
  },
})
