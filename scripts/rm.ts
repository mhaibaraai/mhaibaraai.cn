import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import fg from 'fast-glob'

interface CleanupStats {
  totalRemoved: number
  totalAttempted: number
  failedRemovals: number
}

const args = process.argv.slice(2)
const TARGETS_TO_REMOVE = args.length > 0 ? args : ['node_modules', '.nuxt', '.data', '.output', 'dist', 'dist.zip']
const ROOT_DIR = resolve(process.cwd())

async function removePath(targetPath: string, stats: CleanupStats): Promise<void> {
  stats.totalAttempted++
  try {
    await rm(targetPath, { recursive: true, force: true })
    stats.totalRemoved++
  }
  catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error(`Error removing ${targetPath}:`, error.message)
      stats.failedRemovals++
    }
  }
}

async function cleanProject(): Promise<void> {
  const startTime = Date.now()
  const stats: CleanupStats = { totalRemoved: 0, totalAttempted: 0, failedRemovals: 0 }

  console.log('Searching for targets to remove...')
  const globPatterns = TARGETS_TO_REMOVE.map(target => `**/${target}`)
  const pathsToRemove = await fg(globPatterns, {
    cwd: ROOT_DIR,
    onlyFiles: false, // We want to match directories and files like pnpm-lock.yaml
    dot: true, // Match dotfiles like .nuxt
    absolute: true,
    ignore: ['**/node_modules/**/node_modules/**'], // Avoid deep nested node_modules issues
  })

  if (pathsToRemove.length === 0) {
    console.log('No targets found to remove.')
    return
  }

  const removalPromises = pathsToRemove.map(p => removePath(p, stats))
  await Promise.all(removalPromises)

  const duration = (Date.now() - startTime) / 1000
  console.log(`Cleanup completed in ${duration.toFixed(2)}s - removed ${stats.totalRemoved}/${stats.totalAttempted} items`)

  if (stats.failedRemovals > 0) {
    console.warn(`${stats.failedRemovals} items failed to remove`)
  }
}

cleanProject().catch((error) => {
  console.error('Cleanup failed:', error.message)
  process.exit(1)
})
