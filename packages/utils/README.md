# utils Markdown API

通用解析器从 `utils/markdown` 导入，不依赖 React、Tiptap 或 XSS 策略

```ts
import { loadMarkdownParser } from 'utils/markdown'

const parser = await loadMarkdownParser()
const html = parser.parse('占比**40%**以上')

// 不加载 CJK 插件，使用标准规则
const standard = await loadMarkdownParser({ cjkFriendly: false })
```

- `cjkFriendly` 默认 `true`，支持中日韩强调与删除线边界，不补空格
- 插件通过动态 import 按需加载；缓存模块加载，每次返回独立解析器，不影响全局 marked
- 如需同步初始化，先 `await loadCjkMarkdownSupport()`，再 `createMarkdownParser()`；未加载时抛错，不会静默降级
- `mdToHTML()` 复用此工厂，继续提供链接、换行和 XSS 策略；它的历史参数 `preprocessMarkdownFormat: false` 可关闭 CJK 兼容
- 工厂只提供解析机制，直接使用其 HTML 输出时，调用方需自行处理不可信内容的安全过滤
