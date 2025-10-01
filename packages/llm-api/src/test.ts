import type { OpenAiReqMessage } from './types'
import { cerebrasApi, CerebrasModelEnum, cloudflareApi, CloudflareModelEnum, cohereApi, CohereModelEnum, geminiApi, GeminiModelEnum, glmApi, GlmModelEnum, groqApi, GroqModelEnum, mistralApi, MistralModelEnum, modelscopeApi, ModelscopeModelEnum, openRouterApi, OpenRouterModelEnum, siliconflowApi } from './lib'
import { OpenAiRoleEnum } from './types'

main()

async function main() {
  const question = '请回答我的名字是什么'
  const t = process.argv[2]

  /** 示例：历史消息记录 */
  const historyMessages: OpenAiReqMessage[] = [
    { role: OpenAiRoleEnum.User, content: '你好，我叫张三' },
    { role: OpenAiRoleEnum.Assistant, content: '你好张三！很高兴认识你。' },
    { role: OpenAiRoleEnum.User, content: '请记住我的名字' },
    { role: OpenAiRoleEnum.Assistant, content: '好的，我会记住你的名字是张三。' },
  ]

  if (t === 'gemini') {
    const data = await geminiApi.chatCompletions({
      /** 使用历史消息，不传 question */
      messages: historyMessages,
      /** 或者同时传入 question 和 messages */
      question,
      model: GeminiModelEnum.Gemini_25_Flash_Lite,
      stream: true,
      onStream(resp) {
        console.log(geminiApi.composeStreamMessage(resp))
      },
    })
    return
  }

  if (t === 'openrouter') {
    const data = await openRouterApi.chatCompletions({
      question,
      messages: historyMessages, // 会自动合并历史消息和当前问题
      model: OpenRouterModelEnum.DeepSeek_V3_03_24,
      stream: true,
      onStream(resp) {
        const { content, reasoning } = openRouterApi.composeStreamMessage(resp)
        console.log({ content, reasoning })
      },
    })
    return
  }

  if (t === 'openrouter-r1') {
    const data = await openRouterApi.chatCompletions({
      question,
      messages: historyMessages,
      model: OpenRouterModelEnum.DeepSeek_R1_0528_Qwen3_8B,
      stream: true,
      onStream(resp) {
        const { content, reasoning } = openRouterApi.composeStreamMessage(resp)
        console.log({ content, reasoning })
      },
    })
    return
  }

  if (t === 'cloudflare') {
    const data = await cloudflareApi.chatCompletions({
      question,
      messages: historyMessages,
      model: CloudflareModelEnum.LLM_31_8B_INSTRUCT,
      stream: true,
      onStream(resp) {
        console.log(cloudflareApi.composeStreamMessage(resp))
      },
    })
    return
  }

  if (t === 'glm') {
    await glmApi.chatCompletions({
      question,
      messages: historyMessages,
      model: GlmModelEnum.GLM_4_5_Flash,
      stream: true,
      onStream(resp) {
        const { content, reasoning } = glmApi.composeStreamMessage(resp)
        console.log({ content, reasoning })
      },
    })
  }

  if (t === 'glm-no-thinking') {
    const data = await glmApi.chatCompletions({
      question,
      messages: historyMessages,
      model: GlmModelEnum.GLM_4_5_Flash,
      stream: true,
      onStream(data) {
        const { content, reasoning } = glmApi.composeStreamMessage(data)
        console.log('回答内容：', content)
        console.log('思考过程：', reasoning)
      },
    })
    return
  }

  if (t === 'siliconflow') {
    const data = await siliconflowApi.chatCompletions({
      question: '峰哥，怎么看足疗正不正规啊',
      // messages: historyMessages,
      model: 'ft:LoRA/Qwen/Qwen2.5-7B-Instruct:d29jk7c50mis73e8bdp0:feng:yqbhwtqwtjiohbzfdzcu',
      stream: true,
      onStream(resp) {
        const { content, reasoning } = siliconflowApi.composeStreamMessage(resp)
        console.log({ content, reasoning })
      },
    })
    return
  }

  if (t === 'cerebras') {
    const data = await cerebrasApi.chatCompletions({
      question,
      messages: historyMessages,
      model: CerebrasModelEnum.Llama_4_Scout,
      stream: true,
      onStream(resp) {
        const { content, reasoning } = cerebrasApi.composeStreamMessage(resp)
        console.log({ content, reasoning })
      },
    })
    return
  }

  if (t === 'cohere') {
    const data = await cohereApi.chatCompletions({
      question,
      messages: historyMessages,
      model: CohereModelEnum.Command_A,
      stream: true,
      onStream(resp) {
        const { content, reasoning } = cohereApi.composeStreamMessage(resp)
        console.log({ content, reasoning })
      },
    })
    return
  }

  if (t === 'groq') {
    const data = await groqApi.chatCompletions({
      question,
      messages: historyMessages,
      model: GroqModelEnum.DeepSeek_R1_Distill_Llama_70B,
      stream: true,
      onStream(resp) {
        const { content, reasoning } = groqApi.composeStreamMessage(resp)
        console.log({ content, reasoning })
      },
    })
    return
  }

  if (t === 'mistral') {
    const data = await mistralApi.chatCompletions({
      question,
      messages: historyMessages,
      model: MistralModelEnum.Codestral_2405,
      stream: true,
      onStream(resp) {
        const { content, reasoning } = mistralApi.composeStreamMessage(resp)
        console.log({ content, reasoning })
      },
    })
    return
  }

  if (t === 'modelscope') {
    const data = await modelscopeApi.chatCompletions({
      question,
      messages: historyMessages,
      model: ModelscopeModelEnum.GLM_4_5,
      stream: true,
      onStream(resp) {
        const { content, reasoning } = modelscopeApi.composeStreamMessage(resp)
        console.log({ content, reasoning })
      },
    })
    return
  }
}
