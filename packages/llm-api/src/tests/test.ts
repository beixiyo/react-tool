import { runTest } from './runner'

main()

async function main() {
  const testType = process.argv[2]

  if (!testType) {
    console.log('📋 使用方法:')
    console.log('  pnpm test <测试类型>')
    console.log('  pnpm test all  # 运行所有测试')
    console.log('')
    console.log('📋 可用的测试类型:')
    console.log('  - gemini')
    console.log('  - openrouter')
    console.log('  - openrouter-r1')
    console.log('  - cloudflare')
    console.log('  - glm')
    console.log('  - glm-embeddings')
    console.log('  - huggingface-embeddings')
    console.log('  - siliconflow')
    console.log('  - cerebras')
    console.log('  - cohere')
    console.log('  - groq')
    console.log('  - mistral')
    console.log('  - modelscope')
    console.log('  - all')
    return
  }

  await runTest(testType)
}
