import { defineConfig } from 'oxlint'

export default defineConfig({
  plugins: ['react'],
  jsPlugins: ['@jl-org/eslint-plugins'],
  rules: {
    'react/exhaustive-deps': 'warn',
    'react/rules-of-hooks': 'error',
    '@jl-org/eslint-plugins/forceTernary': 'warn',
    '@jl-org/eslint-plugins/docComment': [
      'warn',
      {
        pattern: '.*',
      },
    ],
    '@jl-org/eslint-plugins/reactVIf': 'error',
  },
})
