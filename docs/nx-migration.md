# Turbo → Nx 迁移说明

## 做了什么
- 移除 Turbo，新增 Nx 作为任务编排与缓存工具。
- 新增 `nx.json` 与各包的 `project.json`，用 `nx:run-commands` 复用原有包内脚本。
- 根脚本改为调用 Nx：`dev/build/lint` 全部通过 Nx 统一调度。
- 忽略 `.nx/` 缓存目录，删除了旧的 `turbo.json`。

## 需要安装
```bash
pnpm install # 会同步安装新的 devDependency: nx
```

## 可以删除/清理
- `turbo.json`（已删）
- `.turbo/` 缓存目录（可清理）
- 若本地有 `out/`、`node_modules/.cache/turbo` 等 Turbo 缓存，可一并移除

## 新文件/配置含义
- `nx.json`
  - `tasksRunnerOptions.default.runner`: 使用 Nx 内置任务运行器与缓存，缓存目录 `.nx/cache`
  - `targetDefaults`: 约定默认输入/输出；`dev` 禁用缓存，`build` 默认输出 `dist`
  - `projects`: 声明 mono-repo 中的应用与库路径，apps/libs 均在 `packages/`
- `packages/*/project.json`
  - `executor: nx:run-commands`: 直接调用已有 pnpm 脚本，保持包内逻辑不变
  - `outputs`: 仅对需要产物的目标声明（如 `dist`），便于 Nx 缓存与增量
  - `implicitDependencies`: 声明项目间依赖，帮助 Nx 绘制任务图

## 命令对照（常用）
- 开发：`pnpm dev` → `nx run app:dev`
- 构建所有：`pnpm build` → `nx run-many -t build --projects app,comps,hooks,utils`
- 单包构建：`pnpm build:app|comps|hooks|utils`
- Lint 所有：`pnpm lint` → `nx run-many -t lint --projects app,comps,hooks,utils,config`
- 单包 Lint：`pnpm lint:app|comps|hooks|utils|config`
- 任务图：`pnpm graph`（或 `nx graph`）查看依赖关系与缓存命中情况

## 迁移后建议
1) 全量安装一次依赖，确保 Nx 正常拉起：`pnpm install`
2) 清理旧缓存：`rm -rf .turbo`（可选）
3) 首次运行 `pnpm build`，让 Nx 建立缓存
4) 如需 CI 缓存，可同步缓存 `.nx/cache`

