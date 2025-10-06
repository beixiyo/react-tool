import {
  runCerebrasTest,
  runCloudflareTest,
  runCohereTest,
  runGeminiTest,
  runGlmEmbeddingsTest,
  runGlmTest,
  runGroqTest,
  runHuggingFaceEmbeddingsTest,
  runMistralTest,
  runModelScopeTest,
  runOpenRouterR1Test,
  runOpenRouterTest,
  runSiliconFlowTest,
} from './index'

/**
 * 测试运行器
 * 根据命令行参数运行对应的测试
 */
export async function runTest(testType: string) {
  console.log(`🎯 运行测试: ${testType}`)
  console.log('='.repeat(50))

  try {
    switch (testType) {
      case 'gemini':
        await runGeminiTest()
        break
      case 'openrouter':
        await runOpenRouterTest()
        break
      case 'openrouter-r1':
        await runOpenRouterR1Test()
        break
      case 'cloudflare':
        await runCloudflareTest()
        break
      case 'glm':
        await runGlmTest()
        break
      case 'glm-embeddings':
        await runGlmEmbeddingsTest()
        break
      case 'huggingface-embeddings':
        await runHuggingFaceEmbeddingsTest()
        break
      case 'siliconflow':
        await runSiliconFlowTest()
        break
      case 'cerebras':
        await runCerebrasTest()
        break
      case 'cohere':
        await runCohereTest()
        break
      case 'groq':
        await runGroqTest()
        break
      case 'mistral':
        await runMistralTest()
        break
      case 'modelscope':
        await runModelScopeTest()
        break
      case 'all':
        await runAllTests()
        break
      default:
        console.log('❌ 未知的测试类型:', testType)
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
  }
  catch (error) {
    console.error('❌ 测试运行失败:', error)
    process.exit(1)
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始运行所有 API 测试...')
  console.log('='.repeat(50))

  const tests = [
    { name: 'Gemini', fn: runGeminiTest },
    { name: 'OpenRouter', fn: runOpenRouterTest },
    { name: 'OpenRouter R1', fn: runOpenRouterR1Test },
    { name: 'Cloudflare', fn: runCloudflareTest },
    { name: 'GLM', fn: runGlmTest },
    { name: 'GLM Embeddings', fn: runGlmEmbeddingsTest },
    { name: 'Hugging Face Embeddings', fn: runHuggingFaceEmbeddingsTest },
    { name: 'SiliconFlow', fn: runSiliconFlowTest },
    { name: 'Cerebras', fn: runCerebrasTest },
    { name: 'Cohere', fn: runCohereTest },
    { name: 'Groq', fn: runGroqTest },
    { name: 'Mistral', fn: runMistralTest },
    { name: 'ModelScope', fn: runModelScopeTest },
  ]

  const results = []

  for (const test of tests) {
    try {
      console.log(`\n🧪 测试 ${test.name}...`)
      await test.fn()
      results.push({ name: test.name, status: 'success' })
    }
    catch (error) {
      console.error(`❌ ${test.name} 测试失败:`, error)
      results.push({ name: test.name, status: 'failed', error })
    }
  }

  /** 输出测试结果汇总 */
  console.log(`\n${'='.repeat(50)}`)
  console.log('📊 测试结果汇总:')
  console.log('='.repeat(50))

  const successCount = results.filter(r => r.status === 'success').length
  const failedCount = results.filter(r => r.status === 'failed').length

  results.forEach((result) => {
    const status = result.status === 'success'
      ? '✅'
      : '❌'
    console.log(`${status} ${result.name}`)
  })

  console.log('='.repeat(50))
  console.log(`📈 总计: ${results.length} 个测试`)
  console.log(`✅ 成功: ${successCount} 个`)
  console.log(`❌ 失败: ${failedCount} 个`)
  console.log('='.repeat(50))

  if (failedCount > 0) {
    process.exit(1)
  }
}
