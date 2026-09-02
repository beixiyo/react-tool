import { Bug, Code, FileText, HelpCircle, Languages, TestTube, User, Zap } from 'lucide-react'
import { isApplePlatform } from 'utils/keyboard'
import type { PromptCategoryConfig, PromptTemplate } from './types'

/**
 * 提示词分类配置
 */
export const PROMPT_CATEGORIES: PromptCategoryConfig[] = [
  {
    key: 'code',
    icon: <Code size={ 16 } />,
  },
  {
    key: 'debug',
    icon: <Bug size={ 16 } />,
  },
  {
    key: 'document',
    icon: <FileText size={ 16 } />,
  },
  {
    key: 'explain',
    icon: <HelpCircle size={ 16 } />,
  },
  {
    key: 'optimize',
    icon: <Zap size={ 16 } />,
  },
  {
    key: 'test',
    icon: <TestTube size={ 16 } />,
  },
  {
    key: 'translate',
    icon: <Languages size={ 16 } />,
  },
  {
    key: 'custom',
    icon: <User size={ 16 } />,
  },
]

/**
 * 创建默认提示词模板的函数
 * @param t 翻译函数
 * @returns 默认提示词模板数组
 */
export function createDefaultPromptTemplates(t: (key: string) => string): PromptTemplate[] {
  return [
    /** 代码相关 */
    {
      id: 'code-explain',
      title: t('chatInput.templates.codeExplain.title'),
      content: '请详细解释这段代码的功能、逻辑和实现原理：\n\n```\n{code}\n```',
      description: t('chatInput.templates.codeExplain.description'),
      category: 'explain',
      icon: <HelpCircle size={ 16 } />,
      usageCount: 0,
      tags: ['代码', '解释', '分析'],
    },
    {
      id: 'code-optimize',
      title: t('chatInput.templates.codeOptimize.title'),
      content: '请帮我优化这个函数，提高其性能、可读性和可维护性：\n\n```\n{code}\n```\n\n请提供优化后的代码和改进说明。',
      description: t('chatInput.templates.codeOptimize.description'),
      category: 'optimize',
      icon: <Zap size={ 16 } />,
      usageCount: 0,
      tags: ['优化', '性能', '重构'],
    },
    {
      id: 'code-review',
      title: t('chatInput.templates.codeReview.title'),
      content: '请对以下代码进行审查，指出潜在问题、改进建议和最佳实践：\n\n```\n{code}\n```',
      description: t('chatInput.templates.codeReview.description'),
      category: 'code',
      icon: <Code size={ 16 } />,
      usageCount: 0,
      tags: ['审查', '质量', '最佳实践'],
    },
    {
      id: 'write-test',
      title: t('chatInput.templates.writeTest.title'),
      content: '请为以下代码编写完整的单元测试，包括正常情况和边界情况：\n\n```\n{code}\n```\n\n请使用适当的测试框架和断言。',
      description: t('chatInput.templates.writeTest.description'),
      category: 'test',
      icon: <TestTube size={ 16 } />,
      usageCount: 0,
      tags: ['测试', '单元测试', 'TDD'],
    },
    {
      id: 'debug-error',
      title: t('chatInput.templates.debugError.title'),
      content: '我遇到了以下错误，请帮我分析原因并提供解决方案：\n\n错误信息：\n```\n{error}\n```\n\n相关代码：\n```\n{code}\n```',
      description: t('chatInput.templates.debugError.description'),
      category: 'debug',
      icon: <Bug size={ 16 } />,
      usageCount: 0,
      tags: ['调试', '错误', '问题排查'],
    },
    {
      id: 'add-comments',
      title: t('chatInput.templates.addComments.title'),
      content: '请为以下代码添加详细的注释，包括函数说明、参数说明和返回值说明：\n\n```\n{code}\n```',
      description: t('chatInput.templates.addComments.description'),
      category: 'document',
      icon: <FileText size={ 16 } />,
      usageCount: 0,
      tags: ['注释', '文档', 'JSDoc'],
    },
    {
      id: 'refactor-code',
      title: t('chatInput.templates.refactorCode.title'),
      content: '请帮我重构以下代码，使其更加清晰、模块化和易于维护：\n\n```\n{code}\n```\n\n请保持原有功能不变。',
      description: t('chatInput.templates.refactorCode.description'),
      category: 'code',
      icon: <Code size={ 16 } />,
      usageCount: 0,
      tags: ['重构', '模块化', '清理'],
    },
    {
      id: 'translate-code',
      title: t('chatInput.templates.translateCode.title'),
      content: '请将以下代码从 {from_lang} 转换为 {to_lang}：\n\n```{from_lang}\n{code}\n```\n\n请保持逻辑和功能完全一致。',
      description: t('chatInput.templates.translateCode.description'),
      category: 'translate',
      icon: <Languages size={ 16 } />,
      usageCount: 0,
      tags: ['转换', '语言', '迁移'],
    },
  ]
}

/**
 * 获取修饰键显示文本（Mac 显示 ⌘，其他显示 Ctrl）
 */
export function getModifierKeyText(): string {
  return isApplePlatform()
    ? '⌘'
    : 'Ctrl'
}

/**
 * 格式化快捷键显示文本
 * @param key 按键
 * @returns 格式化后的快捷键文本
 */
export function formatShortcut(key: string): string {
  const modifier = getModifierKeyText()
  return `${modifier} + ${key}`
}
