import { fakerZH_CN as faker } from '@faker-js/faker'

export const TOOL_PRESETS = ['Jira', 'Notion', 'Confluence', 'Figma', 'Storybook', 'Linear', 'Postman']

export function generateSentences(min = 1, max = 2, separator = ' ') {
  const count = faker.number.int({ min, max })
  return Array.from({ length: count }).map(() => faker.lorem.sentence()).join(separator)
}

export function generateParagraphs(min = 1, max = 2) {
  const count = faker.number.int({ min, max })
  return Array.from({ length: count }).map(() => faker.lorem.paragraph()).join('\n\n')
}

export function nanoid(prefix: string) {
  return `${prefix}-${faker.string.nanoid(10)}`
}

export function createRequirementMetadata() {
  return {
    goals: faker.helpers.arrayElements(
      ['提升 DAU', '缩短交付周期', '增强协作透明度', '提升客户满意度', '降低运营成本'],
      { min: 2, max: 3 },
    ),
    constraints: faker.helpers.arrayElements(
      ['预算受限', '需兼容现有系统', '安全合规要求', '交付周期不得超过两个月'],
      { min: 1, max: 2 },
    ),
    successCriteria: faker.helpers.arrayElements(
      ['用户满意度达到 4.5', '交付后缺陷率低于 0.5%', '首周留存率提升 15%'],
      { min: 2, max: 3 },
    ),
    references: Array.from({ length: faker.number.int({ min: 1, max: 2 }) }).map(() => ({
      id: nanoid('ref'),
      type: 'link' as const,
      name: faker.company.catchPhrase(),
      url: faker.internet.url(),
      description: faker.lorem.sentence(),
    })),
  }
}

export function createContextSummary(index: number) {
  return {
    id: nanoid('ctx'),
    sourceSessionId: nanoid(`session-${index}`),
    title: `上下文总结 ${index + 1}`,
    summary: faker.lorem.paragraph(),
    importance: faker.helpers.arrayElement(['low', 'medium', 'high'] as const),
    tokens: {
      original: faker.number.int({ min: 800, max: 2400 }),
      compressed: faker.number.int({ min: 300, max: 900 }),
    },
    updatedAt: Date.now() - faker.number.int({ min: 60_000, max: 2_160_000 }),
  }
}
