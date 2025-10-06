import { runGlmEmbeddingsTest } from './glm-embeddings.test'

main()

async function main() {
  const testType = process.argv[2]

  if (!testType) {
    console.log('📋 GLM 嵌入模型测试使用方法:')
    console.log('  pnpm test:embeddings <测试类型>')
    console.log('')
    console.log('📋 可用的测试类型:')
    console.log('  - basic        # 基础嵌入功能测试')
    console.log('  - config       # 配置测试')
    console.log('  - all          # 运行所有嵌入测试')
    return
  }

  console.log(`🎯 运行 GLM 嵌入模型测试: ${testType}`)
  console.log('='.repeat(50))

  try {
    switch (testType) {
      case 'basic':
        await runGlmEmbeddingsTest()
        break

      case 'all':
        console.log('🚀 运行所有 GLM 嵌入模型测试...')
        await runGlmEmbeddingsTest()
        console.log(`\n${'='.repeat(50)}`)
        break
      default:
        console.log('❌ 未知的测试类型:', testType)
        console.log('📋 可用的测试类型:')
        console.log('  - basic')
        console.log('  - config')
        console.log('  - all')
        return
    }
  }
  catch (error) {
    console.error('❌ GLM 嵌入模型测试运行失败:', error)
    process.exit(1)
  }
}
