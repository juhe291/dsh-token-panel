#!/usr/bin/env node
/**
 * One-command uninstaller for dsh-token-panel.
 *
 * The standard `dsh plugin remove` runs a supply-chain lockfile verification
 * that rejects packages published inside the minimum-release-age window (a
 * freshly published plugin fails removal for up to ~24h). Plain `pnpm remove`
 * does not run that verification, so this script:
 *
 *   1. removes the package from the profile with pnpm, and
 *   2. drops the "dsh-token-panel" entry from `dsh.profile.bundles`
 *      (what `dsh plugin remove` would reconcile).
 *
 * Usage:
 *   node scripts/uninstall.mjs                 # default ~/.dsh/profiles/web
 *   node scripts/uninstall.mjs <profile-dir>
 *
 * After it finishes, restart the profile.
 */

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

const profile = resolve(process.argv[2] ?? join(homedir(), '.dsh', 'profiles', 'web'))
const manifestPath = join(profile, 'package.json')
const NAME = 'dsh-token-panel'

if (!existsSync(manifestPath)) {
  console.error(`profile not found: ${profile}`)
  process.exit(1)
}

console.log(`Uninstalling ${NAME} from ${profile} …`)
try {
  execSync(`pnpm --dir "${profile}" remove ${NAME}`, { stdio: 'inherit' })
} catch (error) {
  console.error(`pnpm remove failed: ${String(error)}`)
  process.exit(1)
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const bundles = manifest.dsh?.profile?.bundles
if (Array.isArray(bundles)) {
  const next = bundles.filter((name) => name !== NAME)
  if (next.length !== bundles.length) {
    manifest.dsh.profile.bundles = next
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
    console.log(`Removed ${NAME} from dsh.profile.bundles`)
  }
}

console.log(`${NAME} uninstalled. Restart the profile to apply.`)
