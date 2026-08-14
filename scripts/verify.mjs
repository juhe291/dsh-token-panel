/** Verify the dsh-token-panel build artifacts are complete and consistent. */

import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const failures = []

function check(condition, message) {
  if (condition) return
  failures.push(message)
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

// Exports targets must exist.
for (const [name, entry] of Object.entries(pkg.exports ?? {})) {
  const target = typeof entry === 'string' ? entry : entry.default
  check(existsSync(join(root, target)), `export "${name}" -> ${target} missing`)
}

// Host and client halves must both be emitted.
check(existsSync(join(root, 'lib/index.js')), 'lib/index.js (host) missing')
check(existsSync(join(root, 'lib/client.js')), 'lib/client.js (client bundle) missing')
check(existsSync(join(root, 'cordis.patch.yml')), 'cordis.patch.yml missing')

// Client bundle must be wrapped by the module loader.
const client = readFileSync(join(root, 'lib/client.js'), 'utf8')
check(client.includes('window.__ModuleLoader__.load'), 'client bundle missing __ModuleLoader__ wrapper')

// CSS modules must be inlined into the client bundle.
check(client.includes('data-plugin-css') || client.includes('data.pluginCss'), 'client bundle missing inlined CSS modules')

// No leftover references to the source tree in the emitted client bundle.
check(!client.includes('/src/'), 'client bundle references src/ tree (should be emitted-only)')

// Patch must reference this package by name.
const patch = readFileSync(join(root, 'cordis.patch.yml'), 'utf8')
check(patch.includes(pkg.name), 'cordis.patch.yml does not reference package name')

// Bundle manifest fields.
check(pkg.dsh?.bundle?.patch === './cordis.patch.yml', 'dsh.bundle.patch mismatch')
check(pkg.dsh?.client?.platform === 'web', 'dsh.client.platform must be web')
check(existsSync(join(root, pkg.dsh.client.inject[0].replace(/\/client$/, ''), 'package.json')) === false, 'unexpected inject path check')

if (failures.length > 0) {
  console.error('dsh-token-panel verify failed:')
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}
console.log('dsh-token-panel verify OK')
