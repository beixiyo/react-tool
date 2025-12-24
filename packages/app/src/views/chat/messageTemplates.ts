/**
 * 消息模板配置
 * 用于生成思考过程和回复内容
 */

export const messageTemplates = {
  /**
   * 生成思考内容
   */
  generateThinkingContent: (userQuestion: string): string => {
    return `我正在思考如何回应您的问题："${userQuestion}"...\n\n需要考虑的因素：\n1. 用户的具体需求\n2. 相关的市场数据\n3. 可能的解决方案`
  },

  /**
   * 生成思考完成内容
   */
  generateThinkingCompleteContent: (userQuestion: string, thinkingContent: string): string => {
    const additionalContent = `\n\n我已分析完您的问题："${userQuestion}"\n\n基于分析，我将从以下几个方面为您提供建议：\n1. 市场定位\n2. 竞争优势\n3. 发展策略`
    return thinkingContent + additionalContent
  },

  /**
   * 生成回复内容
   */
  generateAnswerContent: (): string => {
    return `感谢您的问题。根据您提供的信息，我建议您考虑以下几点：\n\n1. 针对您的具体需求，可以...\n2. 从市场数据来看，目前趋势是...\n3. 建议您采取的解决方案包括...`
  },

  /**
   * 生成示例图片数据
   */
  generateExampleImages: () => [
    {
      url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      caption: '相关解决方案示意图',
    },
  ],

  /**
   * 生成示例文件数据
   */
  generateExampleFiles: () => [
    {
      name: '解决方案详细说明.docx',
      size: 1548576,
      url: '#',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
  ],
} as const
