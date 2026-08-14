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
        /** 仅匹配文字字符开头，跳过分隔线、装饰符号和 emoji 等特殊符号 */
        pattern: '^[A-Za-z0-9\\u00C0-\\u02AF\\u3040-\\u30FF\\u3400-\\u4DBF\\u4E00-\\u9FFF\\uAC00-\\uD7AF]',
      },
    ],
    '@jl-org/eslint-plugins/reactVIf': 'error',
  },
})
