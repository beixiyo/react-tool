# Nx 使用速览（适配当前 mono-repo）

## 常用命令
```bash
# 查看任务图（依赖与缓存命中）
pnpm nx graph

# 启动开发（app）
pnpm nx run app:dev

# 构建所有指定项目（并行 + 缓存）
pnpm nx run-many -t build --projects app,comps,hooks,utils

# Lint 所有
pnpm nx run-many -t lint --projects app,comps,hooks,utils,config

# 只运行受改动影响的构建 / lint（需有 git 变更）
pnpm nx affected -t build
pnpm nx affected -t lint
```

## 配置速查
```jsonc
// nx.json
{
  "workspaceLayout": { "appsDir": "packages", "libsDir": "packages" },
  "tasksRunnerOptions": {
    "default": { "runner": "nx/tasks-runners/default", "options": { "cacheDirectory": ".nx/cache" } }
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],          // 先构建依赖包，再构建当前包
      "inputs": ["default", "^default"],
      "outputs": ["{projectRoot}/dist"]
    },
    "dev": { "cache": false }            // 开发任务不缓存
  }
}
```

```jsonc
// 示例：packages/app/project.json
{
  "name": "app",
  "targets": {
    "dev":  { "executor": "nx:run-commands", "options": { "command": "pnpm --filter app dev" }, "cache": false },
    "build":{ "executor": "nx:run-commands", "options": { "command": "pnpm --filter app build" }, "outputs": ["{projectRoot}/dist"] },
    "lint": { "executor": "nx:run-commands", "options": { "command": "pnpm --filter app lint" } }
  },
  "implicitDependencies": ["comps","hooks","utils","styles","config"] // 绘制依赖图 & 受影响计算
}
```

## 最佳实践（当前仓库）
- 始终用 Nx 跑跨包任务：`nx run-many -t build|lint`，让缓存与依赖顺序生效。
- 受改动执行：CI 本地可用 `nx affected -t build -t lint`，减少无关任务。
- 声明 outputs：确保产物目录写入 `{projectRoot}/dist`，命中缓存更稳定。
- 开发任务禁用缓存：`dev`/`preview` 设 `cache: false`，避免持久化本地状态。
- 依赖声明：在 `project.json` 设置 `implicitDependencies`，保证任务图正确。
- 缓存目录：本地 `.nx/cache`；CI 可将该目录加入缓存策略。

## 创建新包/库（generator）
```bash
# 创建新库（放在 packages 下），使用 js 库脚手架
pnpm nx g @nx/js:library my-lib --directory=packages/my-lib --importPath=@react-tool/my-lib

# 如需带 Vite 打包能力，可选择：
pnpm nx g @nx/js:library my-lib --directory=packages/my-lib --bundler=vite --importPath=@react-tool/my-lib

# 创建新应用（如需）
pnpm nx g @nx/react:app my-app --directory=packages/my-app --bundler=vite
```
- 生成后会有对应 `project.json`，可参考现有项目把 `executor` 改成 `nx:run-commands` 调用自定义脚本。
- 若继续复用手写 Vite 配置，可在新包 `package.json` 里添加 `build`/`lint` 脚本，再在 `project.json` 里引用。

## 迁移/排错小贴士
- 依赖未构建导致的缺文件：确认 `dependsOn: ["^build"]` 是否存在，或先跑 `nx run comps:build` 等。
- 缓存问题：清理 `.nx/cache` 重新跑；CI 记得更新缓存路径（从 `.turbo` 换到 `.nx`）。
- 任务找不到：`nx list` 查看已安装插件；生成器命令需要对应插件已安装。
