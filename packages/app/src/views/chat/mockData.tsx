import type { DropdownItem } from 'comps'
import type { ChatMessage, ReportData } from './types'
import { uniqueId } from '@jl-org/tool'
import {
  CardIcons,
  CompetitorAnalysisContent,
  DataVisualizationContent,
  InvestmentAdviceContent,
  MarketSummaryContent,
  RiskWarningContent,
} from './components/CardContents'

export const mockChatHistory: ChatMessage[] = [
  {
    id: uniqueId(),
    content: '您好，我是市场分析师。请告诉我您需要分析哪个领域的市场情况？',
    sender: 'assistant',
    timestamp: Date.now() - 3600000,
    type: 'text',
  },
  {
    id: uniqueId(),
    content: '我需要分析AI辅助医疗领域的市场情况',
    sender: 'user',
    timestamp: Date.now() - 3500000,
    type: 'text',
  },
  {
    id: uniqueId(),
    content: '好的，我将为您分析AI辅助医疗领域的市场情况。',
    sender: 'assistant',
    timestamp: Date.now() - 3400000,
    type: 'text',
  },
  {
    id: uniqueId(),
    content: '我正在思考如何进行市场分析...\n\n首先，我需要确定分析的维度：\n1. 市场规模与增长趋势\n2. 主要竞争者分析\n3. 目标用户群体特征\n4. 技术发展趋势\n5. 监管环境与政策影响',
    sender: 'assistant',
    timestamp: Date.now() - 3300000,
    type: 'thinking-start',
  },
  {
    id: uniqueId(),
    content: '思考完毕，我将从以下几个方面为您分析AI辅助医疗市场：\n\n1. 市场规模与增长趋势\n2. 主要竞争者分析\n3. 目标用户群体特征\n4. 技术发展趋势\n5. 监管环境与政策影响',
    sender: 'assistant',
    timestamp: Date.now() - 3200000,
    type: 'thinking-end',
  },
  {
    id: uniqueId(),
    content: '# AI辅助医疗市场分析报告\n\n## 1. 市场规模与增长趋势\n\n全球AI辅助医疗市场预计将从2023年的150亿美元增长到2030年的750亿美元，年复合增长率(CAGR)约为26%。\n\n## 2. 主要竞争者分析\n\n### 行业领导者\n- **Google Health**：凭借强大的AI技术和数据分析能力，在医学影像诊断领域处于领先地位\n- **IBM Watson Health**：在临床决策支持系统方面有显著优势\n- **Microsoft Healthcare**：通过Azure云平台提供医疗AI解决方案\n\n### 新兴创新企业\n- **Tempus**：专注于癌症治疗的AI解决方案\n- **Babylon Health**：提供AI驱动的远程医疗咨询服务\n- **Arterys**：专注于心脏和肺部影像的AI分析\n\n## 3. 目标用户群体\n\n- **医疗机构**：医院、诊所、实验室（占市场份额65%）\n- **医疗专业人员**：医生、放射科医师、病理学家（15%）\n- **制药公司**：用于药物研发和临床试验（12%）\n- **患者**：直接面向消费者的健康监测应用（8%）\n\n## 4. 区域市场分布\n\n- 北美：45%（领先市场）\n- 欧洲：25%\n- 亚太：20%（增长最快的地区）\n- 其他：10%',
    sender: 'assistant',
    timestamp: Date.now() - 3100000,
    type: 'markdown',
  },
  {
    id: uniqueId(),
    content: '这是一份很全面的分析，能否提供一些关于AI辅助医疗领域的具体应用案例？',
    sender: 'user',
    timestamp: Date.now() - 3000000,
    type: 'text',
  },
  {
    id: uniqueId(),
    content: '',
    sender: 'assistant',
    timestamp: Date.now() - 2800000,
    type: 'loading',
  },
  {
    id: uniqueId(),
    content: '以下是AI辅助医疗领域的几个具体应用案例，供您参考：',
    sender: 'assistant',
    timestamp: Date.now() - 2700000,
    type: 'text',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        caption: 'AI辅助医疗影像诊断',
      },
      {
        url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80',
        caption: 'AI药物研发',
      },
    ],
    files: [
      {
        name: 'AI辅助医疗市场分析报告.pdf',
        size: 2457600,
        url: '#',
        type: 'application/pdf',
      },
      {
        name: 'AI医疗应用案例集.xlsx',
        size: 1048576,
        url: '#',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    ],
  },

  {
    id: uniqueId(),
    content: '您好，我是品牌策略师。我可以帮助您制定品牌策略和定位。',
    sender: 'assistant',
    timestamp: Date.now() - 1800000,
    type: 'text',
  },
  {
    id: uniqueId(),
    content: '我们正在开发一款AI医疗诊断产品，需要制定品牌策略',
    sender: 'user',
    timestamp: Date.now() - 1700000,
    type: 'text',
  },
  {
    id: uniqueId(),
    content: '',
    sender: 'assistant',
    timestamp: Date.now() - 1600000,
    type: 'loading',
  },

  /** 卡片消息示例 - 使用组件内容 */
  {
    id: uniqueId(),
    content: '',
    sender: 'assistant',
    timestamp: Date.now() - 1500000,
    type: 'card',
    card: {
      title: '市场分析摘要',
      description: '基于最新数据的AI辅助医疗市场分析结果',
      icon: CardIcons.TrendingUp,
      variant: 'info',
      content: <MarketSummaryContent />,
      actions: [
        {
          label: '查看详细报告',
          type: 'primary',
          onClick: () => {},
        },
        {
          label: '下载数据',
          type: 'info',
          onClick: () => {},
        },
      ],
    },
  },

  {
    id: uniqueId(),
    content: '',
    sender: 'assistant',
    timestamp: Date.now() - 1450000,
    type: 'card',
    card: {
      title: '竞争对手分析',
      icon: CardIcons.Users,
      variant: 'default',
      content: <CompetitorAnalysisContent />,
    },
  },

  {
    id: uniqueId(),
    content: '',
    sender: 'assistant',
    timestamp: Date.now() - 1400000,
    type: 'card',
    card: {
      title: '投资建议',
      description: '基于市场分析的投资建议和风险提示',
      icon: CardIcons.DollarSign,
      variant: 'success',
      content: <InvestmentAdviceContent />,
      actions: [
        {
          label: '制定投资计划',
          type: 'primary',
          onClick: () => {},
        },
        {
          label: '风险评估',
          type: 'info',
          onClick: () => {},
        },
      ],
    },
  },

  {
    id: uniqueId(),
    content: '',
    sender: 'assistant',
    timestamp: Date.now() - 1350000,
    type: 'card',
    card: {
      title: '风险提示',
      description: '投资过程中需要注意的潜在风险',
      icon: CardIcons.AlertCircle,
      variant: 'warning',
      content: <RiskWarningContent />,
      actions: [
        {
          label: '了解更多',
          type: 'info',
          onClick: () => {},
        },
      ],
    },
  },

  {
    id: uniqueId(),
    content: '',
    sender: 'assistant',
    timestamp: Date.now() - 1300000,
    type: 'card',
    card: {
      title: '数据可视化',
      icon: CardIcons.BarChart3,
      variant: 'default',
      bordered: false,
      content: <DataVisualizationContent />,
      actions: [
        {
          label: '打开图表',
          type: 'primary',
          onClick: () => {},
        },
        {
          label: '导出数据',
          type: 'info',
          onClick: () => {},
        },
      ],
    },
  },
]

export const mockSideBarHistory: DropdownItem[] = [
  {
    id: '1',
    label: '🤖 AI Development Discussion',
    desc: 'The future of AI looks promising',
    timestamp: new Date(),
    tag: 'AI',
    tagColor: 'bg-blue-100 text-blue-600',
  },
  {
    id: '2',
    label: '⚛️ React Performance Tips',
    desc: 'Let\'s optimize the render cycles',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    tag: 'React',
    tagColor: 'bg-cyan-100 text-cyan-600',
  },
  {
    id: '3',
    label: '🧠 Machine Learning Projects',
    desc: 'The model training is complete',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    tag: 'ML',
    tagColor: 'bg-purple-100 text-purple-600',
  },
  {
    id: '4',
    label: '🎨 UI Design Review',
    desc: 'The new layout looks great!',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    tag: 'Design',
    tagColor: 'bg-pink-100 text-pink-600',
  },
  {
    id: '5',
    label: '🗄️ Database Architecture',
    desc: 'Let\'s discuss the schema design',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    tag: 'DB',
    tagColor: 'bg-green-100 text-green-600',
  },
  {
    id: '6',
    label: '☁️ Cloud Infrastructure',
    desc: 'AWS vs Azure comparison',
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    tag: 'Cloud',
    tagColor: 'bg-yellow-100 text-yellow-600',
  },
  {
    id: '7',
    label: '📱 Mobile App Development',
    desc: 'React Native setup complete',
    timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    tag: 'Mobile',
    tagColor: 'bg-indigo-100 text-indigo-600',
  },
  {
    id: '8',
    label: '🔒 Security Best Practices',
    desc: 'Updated authentication flow',
    timestamp: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    tag: 'Security',
    tagColor: 'bg-red-100 text-red-600',
  },
]

export const mockReportData: ReportData = {
  id: 'report-1',
  title: 'AI辅助医疗市场分析报告',
  description: '全球AI辅助医疗市场深度分析，包含市场规模、竞争格局、技术趋势等关键信息',
  createdAt: Date.now() - 86400000, // 1天前
  updatedAt: Date.now() - 3600000, // 1小时前
  tags: ['AI医疗', '市场分析', '行业报告', '竞争分析'],
  // #region
  items: [
    {
      id: 'item-1',
      type: 'markdown',
      title: '执行摘要',
      content: `# 执行摘要

## 市场概况
全球AI辅助医疗市场正经历快速增长期，预计从2023年的150亿美元增长到2030年的750亿美元，年复合增长率(CAGR)达26%。

## 关键发现
- **市场驱动因素**：人口老龄化、慢性疾病增加、医疗成本上升
- **技术突破**：深度学习、计算机视觉、自然语言处理在医疗领域的应用
- **监管环境**：FDA、CE等监管机构对AI医疗产品的审批流程日趋完善

## 投资建议
建议重点关注医学影像诊断、药物研发、临床决策支持等细分领域的投资机会。`,
      metadata: {
        description: '报告的核心要点和主要结论',
      },
    },
    {
      id: 'item-2',
      type: 'image',
      title: '市场规模增长趋势图',
      content: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      metadata: {
        description: '展示AI辅助医疗市场从2020年到2030年的增长预测',
        dimensions: { width: 1470, height: 980 },
      },
    },
    {
      id: 'item-3',
      type: 'markdown',
      title: '竞争格局分析',
      content: `# 竞争格局分析

## 行业领导者

### Google Health
- **优势**：强大的AI技术和数据分析能力
- **主要产品**：AI眼科筛查、皮肤病诊断
- **市场份额**：约15%

### IBM Watson Health
- **优势**：临床决策支持系统
- **主要产品**：Watson for Oncology、Watson for Drug Discovery
- **市场份额**：约12%

### Microsoft Healthcare
- **优势**：Azure云平台和AI服务
- **主要产品**：Healthcare Bot、Text Analytics for Health
- **市场份额**：约10%

## 新兴创新企业

| 公司 | 专业领域 | 融资轮次 | 估值 |
|------|----------|----------|------|
| Tempus | 癌症治疗AI | Series G | $8.1B |
| Babylon Health | 远程医疗咨询 | 已上市 | $2.3B |
| Arterys | 心肺影像AI | Series C | $300M |`,
      metadata: {
        description: '主要竞争对手的市场地位和竞争优势分析',
      },
    },

    {
      id: 'item-4',
      type: 'video',
      title: 'AI医疗应用案例演示',
      content: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      metadata: {
        duration: 30,
        thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        description: '展示AI在医疗影像诊断中的实际应用效果',
        dimensions: { width: 1280, height: 720 },
      },
    },
    {
      id: 'item-5',
      type: 'file',
      title: '详细市场数据报告',
      content: '#',
      metadata: {
        size: 5242880, // 5MB
        mimeType: 'application/pdf',
        description: '包含完整的市场数据、图表和分析的PDF报告',
      },
    },
    {
      id: 'item-6',
      type: 'text',
      title: '投资建议总结',
      content: `基于我们的深度分析，我们建议投资者重点关注以下几个方面：

1. 医学影像诊断领域
   - 市场需求旺盛，技术相对成熟
   - 监管路径清晰，商业化前景良好
   - 建议关注放射科、病理科、眼科等细分领域

2. 药物研发AI
   - 能够显著缩短研发周期，降低成本
   - 大型制药公司积极采用，市场空间巨大
   - 关注分子设计、临床试验优化等应用

3. 临床决策支持系统
   - 帮助医生提高诊断准确性和效率
   - 与医院信息系统集成度要求高
   - 需要大量临床数据训练和验证

风险提示：
- 监管政策变化风险
- 数据隐私和安全风险
- 技术标准化程度有待提高`,
      metadata: {
        description: '基于分析结果的具体投资建议和风险提示',
      },
    },
  ],
  // #endregion
}
