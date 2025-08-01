const { writeFileSync } = require('node:fs')
const { resolve } = require('node:path')

const time = Date.now()
writeFileSync(
  resolve(__dirname, '../dist/version.json'),
  JSON.stringify({
    version: time,
  }),
)
