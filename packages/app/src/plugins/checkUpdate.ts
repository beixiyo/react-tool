import { autoUpdate } from '@jl-org/tool'

let lastVersion = '0';

(async function () {
  lastVersion = await getVersion()
})()

autoUpdate({
  needUpdate() {
    return !import.meta.env.DEV
  },
  async hasChange() {
    const version = await getVersion()
    return version != lastVersion
  },
  confirmText: 'An update is available, would you like to refresh?',
})

async function getVersion() {
  const data = await fetch(`/version.json?timestamp=${Date.now()}`)
  const resp = await data.json()

  return resp.version
}
