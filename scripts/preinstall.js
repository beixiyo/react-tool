// "scripts": { "preinstall": "node scripts/preinstall.js" }

/** 锁定 pnpm 版本，改为实际要求的版本 */
const REQUIRED_PNPM = '10.24.0'

if (!/pnpm/.test(process.env.npm_execpath || '')) {
  console.error('请使用 pnpm 进行安装')
  process.exit(1)
}

// const match = (process.env.npm_config_user_agent || '').match(/pnpm\/(\S+)/)
// if (match && match[1] !== REQUIRED_PNPM) {
//   console.error(`pnpm 版本不匹配，请使用 pnpm@${REQUIRED_PNPM}（当前：${match[1]}）`)
//   process.exit(1)
// }
