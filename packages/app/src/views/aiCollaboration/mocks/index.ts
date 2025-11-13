/**
 * Mock 数据
 * 模拟 9 步 workflow 的各个阶段
 */

import type {
  BriefSolution,
  BriefSolutionList,
  CompletenessCheckResult,
  DetailedSolution,
  QuestionList,
} from '../types'

/**
 * Mock: 生成问题列表
 */
export function mockGenerateQuestions(requirement: string): QuestionList {
  return {
    message: '为了更好地理解您的需求，我需要了解以下信息：',
    questions: [
      {
        id: crypto.randomUUID(),
        question: '这个项目的主要目标用户是谁？',
        aspect: '目标用户',
        isRequired: true,
      },
      {
        id: crypto.randomUUID(),
        question: '预期的用户规模大概是多少？',
        aspect: '规模',
        isRequired: true,
      },
      {
        id: crypto.randomUUID(),
        question: '项目的预算范围是多少？',
        aspect: '预算',
        isRequired: false,
      },
      {
        id: crypto.randomUUID(),
        question: '期望的上线时间是什么时候？',
        aspect: '时间线',
        isRequired: true,
      },
      {
        id: crypto.randomUUID(),
        question: '是否有特定的技术栈要求？',
        aspect: '技术要求',
        isRequired: false,
      },
    ],
  }
}

/**
 * Mock: 完整性检查
 */
export function mockCheckCompleteness(
  requirement: string,
  answers: Record<string, string>,
): CompletenessCheckResult {
  const answerCount = Object.keys(answers).length

  if (answerCount >= 3) {
    return {
      isComplete: true,
      missingAspects: [],
      analysis: '需求信息已经足够完整，可以开始生成方案。您提供的信息涵盖了目标用户、规模和时间线等关键方面。',
    }
  }

  return {
    isComplete: false,
    missingAspects: [
      {
        aspect: '目标用户',
        reason: '需要明确项目的主要受众群体',
      },
      {
        aspect: '规模预期',
        reason: '需要了解预期的用户规模以便选择合适的技术架构',
      },
    ],
    analysis: '当前需求描述较为简略，还需要补充一些关键信息才能生成更准确的方案。',
  }
}

/**
 * Mock: 生成简略方案
 */
export function mockGenerateBriefSolutions(requirement: string): BriefSolutionList {
  const solutions: BriefSolution[] = [
    {
      id: crypto.randomUUID(),
      name: '传统 CRUD 方案',
      coreConcept: '基于成熟的 MVC 架构，使用关系型数据库存储数据，适合快速开发和迭代。采用服务端渲染提升 SEO 效果。',
      techStack: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
      advantages: [
        '开发周期短，成本低',
        '技术栈成熟，易于招聘和维护',
        'SEO 友好，利于推广',
      ],
      disadvantages: [
        '扩展性有限，大规模时需要重构',
        '实时性较弱',
        '前后端耦合度较高',
      ],
      suitableFor: '适合中小型项目，预算有限，需要快速上线的场景',
      complexity: 'low',
    },
    {
      id: crypto.randomUUID(),
      name: '微服务架构方案',
      coreConcept: '将系统拆分为多个独立的微服务，每个服务负责特定的业务功能。使用消息队列实现服务间通信，提升系统的可扩展性和容错能力。',
      techStack: ['React', 'Nest.js', 'MongoDB', 'RabbitMQ', 'Docker', 'Kubernetes'],
      advantages: [
        '高度可扩展，支持大规模用户',
        '服务独立部署，故障隔离',
        '技术栈灵活，可针对不同服务选择最优方案',
      ],
      disadvantages: [
        '开发和运维成本高',
        '服务间通信复杂，调试困难',
        '需要专业的 DevOps 团队',
      ],
      suitableFor: '适合大型项目，预期用户规模大，需要高可用性和扩展性',
      complexity: 'high',
    },
    {
      id: crypto.randomUUID(),
      name: 'Serverless 方案',
      coreConcept: '使用云服务商提供的 Serverless 平台，无需管理服务器。按需付费，自动扩缩容，降低运维成本。适合流量波动大的场景。',
      techStack: ['React', 'AWS Lambda', 'DynamoDB', 'API Gateway', 'CloudFront'],
      advantages: [
        '零运维，自动扩缩容',
        '按使用量付费，成本可控',
        '快速部署，专注业务逻辑',
      ],
      disadvantages: [
        '冷启动延迟',
        '供应商锁定风险',
        '调试和监控较为复杂',
      ],
      suitableFor: '适合流量不稳定、初创项目或 MVP 快速验证',
      complexity: 'medium',
    },
  ]

  return {
    solutions,
    summary: '根据您的需求，我生成了 3 个不同复杂度的方案。传统方案适合快速上线，微服务方案适合大规模应用，Serverless 方案适合成本敏感型项目。',
  }
}

/**
 * Mock: AI 讨论回复
 */
export function mockDiscussionReply(userMessage: string, solutionName: string): string {
  const replies = [
    `关于 ${solutionName}，这是一个很好的问题。让我详细解释一下...`,
    `针对您提到的 "${userMessage.slice(0, 20)}..."，我的建议是...`,
    `这个方案在实际应用中确实需要考虑这一点。我们可以通过以下方式优化...`,
  ]

  return replies[Math.floor(Math.random() * replies.length)]
}

/**
 * Mock: 生成详细方案
 */
export function mockGenerateDetailedSolution(briefSolution: BriefSolution): DetailedSolution {
  return {
    name: briefSolution.name,
    overview: `${briefSolution.coreConcept} 本方案经过充分讨论和优化，能够满足您的核心需求。`,
    architecture: `
## 系统架构

### 前端层
- 使用 ${briefSolution.techStack[0]} 构建用户界面
- 采用组件化开发，提升代码复用性
- 使用状态管理库管理全局状态

### 后端层
- 使用 ${briefSolution.techStack[1]} 提供 RESTful API
- 实现身份认证和权限控制
- 集成第三方服务（支付、短信等）

### 数据层
- 使用 ${briefSolution.techStack[2]} 存储业务数据
- 实现数据备份和容灾机制
- 优化查询性能
    `.trim(),
    techStack: {
      前端框架: briefSolution.techStack[0] || 'React',
      后端框架: briefSolution.techStack[1] || 'Node.js',
      数据库: briefSolution.techStack[2] || 'PostgreSQL',
      缓存: briefSolution.techStack[3] || 'Redis',
      部署: 'Docker + Nginx',
    },
    implementationSteps: [
      '第一阶段：需求分析和技术选型（1-2 周）',
      '第二阶段：系统设计和数据库设计（2-3 周）',
      '第三阶段：核心功能开发（4-6 周）',
      '第四阶段：测试和优化（2-3 周）',
      '第五阶段：部署上线和监控（1 周）',
    ],
    advantages: briefSolution.advantages,
    disadvantages: briefSolution.disadvantages,
    risks: [
      '技术风险：新技术栈的学习曲线',
      '进度风险：需求变更可能导致延期',
      '人员风险：关键人员离职的影响',
      '安全风险：数据泄露和攻击防护',
    ],
    developmentCost: `预估开发成本：${briefSolution.complexity === 'low'
      ? '20-30 万'
      : briefSolution.complexity === 'medium'
        ? '40-60 万'
        : '80-120 万'}（包含人力、服务器、第三方服务等）`,
    maintenanceCost: `预估年度维护成本：${briefSolution.complexity === 'low'
      ? '5-8 万'
      : briefSolution.complexity === 'medium'
        ? '10-15 万'
        : '20-30 万'}（包含服务器、人力、升级等）`,
  }
}

/**
 * Mock: 加载历史会话
 */
export function mockLoadHistory() {
  /** 开发环境可以返回一些测试数据 */
  return []
}
