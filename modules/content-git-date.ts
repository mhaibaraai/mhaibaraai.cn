import { execFileSync } from 'node:child_process'
import { statSync } from 'node:fs'
import { isAbsolute, join } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'

const DATED_COLLECTIONS = new Set(['docs', 'config'])

function resolveDate(rootDir: string, filePath: string): string {
  const file = isAbsolute(filePath) ? filePath : join(rootDir, 'content', filePath)
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], { cwd: rootDir, encoding: 'utf8' }).trim()
    if (iso) return iso
  } catch {
    // 非 git 环境或浅克隆时回退到文件修改时间
  }
  return statSync(file).mtime.toISOString()
}

/** 为笔记注入最后更新时间（frontmatter 中的 date 优先） */
export default defineNuxtModule({
  meta: { name: 'content-git-date' },
  setup(_, nuxt) {
    nuxt.hook('content:file:afterParse', ({ file, content, collection }) => {
      if (!DATED_COLLECTIONS.has(collection.name) || content.date) return
      content.date = resolveDate(nuxt.options.rootDir, file.path)
    })
  }
})
