# AI Workflow - 智能工作流协作

## 概述

这是基于新需求实现的 AI 工作流系统，支持完整的 9 步协作流程。

## 路由访问

由于项目使用自动路由注册，访问路径为：

```
http://localhost:5173/aiWorkflow
```

## 工作流程

```
1. POST /workflow/start (提出一个问题，如果问题不明确后端会追问直到明确)
   ↓
2. POST /workflow/merge-answers (如果需要更多信息)
   ↓
3. POST /workflow/check-completeness (可选)
   ↓
4. POST /workflow/generate-questions (如果还不完整)
   ↓
重复 2-4，直到信息完整
   ↓
5. POST /workflow/generate-brief-solutions (生成一些简要方法)
   ↓
6. POST /workflow/select-solution (前端选择简要方案)
   ↓
7. POST /workflow/start-discussion (可选探讨)
   ↓
8. POST /workflow/discuss (可选，多轮)
   ↓
9. POST /workflow/generate-detailed-solution (生成最终详细方案)
```

## 目录结构

```
aiWorkflow/
├── components/              # UI 组件
│   ├── RequirementInput.tsx        # 需求输入
│   ├── QuestionDialog.tsx          # 问题对话框
│   ├── BriefSolutionList.tsx       # 简略方案列表
│   ├── DetailedSolutionView.tsx    # 详细方案展示
│   ├── ProgressIndicator.tsx       # 进度指示器
│   └── index.ts
├── hooks/                   # 状态管理
│   └── useWorkflow.ts              # 工作流状态
├── mocks/                   # Mock 数据
│   └── index.ts                    # 模拟 API 响应
├── types/                   # 类型定义
│   ├── workflow.types.ts           # 工作流类型
│   ├── store.types.ts              # Store 类型
│   └── index.ts
├── page.tsx                 # 主页面
└── README.md
```

## 核心功能

### 1. 信息收集阶段

- 用户输入初始需求
- AI 生成问题列表
- 用户回答问题
- 检查信息完整性
- 如需要，继续生成问题

### 2. 方案生成阶段

- 生成 3 个简略方案（数量可调整）
- 展示方案的核心思路、技术栈、优劣势
- 用户选择一个方案

### 3. 详细方案生成

- 基于选中的简略方案
- 生成详细的技术架构
- 提供实施步骤
- 评估成本和风险

## 状态管理

使用 valtio 的 `createProxy` 创建响应式状态：

```typescript
export const workflowStore = createProxy<AiWorkflowStore>({
  currentSession: null,
  stage: WorkflowStage.INFO_COLLECTION,
  isGenerating: false,
  // ...
})
```

## Mock 数据

当前使用 mock 数据模拟后端响应，位于 `mocks/index.ts`：

- `mockGenerateQuestions` - 生成问题列表
- `mockCheckCompleteness` - 检查完整性
- `mockGenerateBriefSolutions` - 生成简略方案
- `mockGenerateDetailedSolution` - 生成详细方案

## 后续接入真实 API

替换 `page.tsx` 中的 mock 调用为真实 API 调用即可：

```typescript
/** 当前 (Mock) */
const questionList = mockGenerateQuestions(requirement)

/** 替换为 (真实 API) */
const questionList = await api.post('/workflow/generate-questions', {
  workflowId: session.workflowId,
})
```

## 与旧版本的关系

- **旧版本**：`packages/app/src/views/aiCollaboration` (保留作为参考)
- **新版本**：`packages/app/src/views/aiWorkflow` (当前实现)

两个版本可以并存，互不影响。

## 技术栈

- **React** - UI 框架
- **TypeScript** - 类型系统
- **Valtio** - 状态管理
- **TailwindCSS** - 样式
- **Framer Motion** - 动画
- **Lucide React** - 图标

## 开发建议

1. 组件已经过优化，使用 `memo` 避免不必要的重渲染
2. 状态直接从 `workflowStore` 获取，避免 props drilling
3. Mock 数据可以根据需要调整，模拟不同场景
4. 所有类型定义都在 `types/` 目录，便于维护

## 待完成功能

- [ ] 历史记录列表（可参考旧版本）
- [ ] 方案讨论功能（步骤 7-8）
- [ ] SSE 流式事件处理
- [ ] 上下文管理
- [ ] 数据持久化
