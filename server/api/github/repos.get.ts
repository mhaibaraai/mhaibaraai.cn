import { queryCollection } from '@nuxt/content/server'
import { z } from 'zod'

const repoSchema = z.object({
  full_name: z.string(),
  stargazers_count: z.number(),
  language: z.string().nullable(),
  pushed_at: z.string()
})

export interface RepoStats {
  stars: number
  language: string | null
  pushedAt: string
}

export default defineCachedEventHandler(async (event) => {
  const { githubToken } = useRuntimeConfig(event)
  const projects = await queryCollection(event, 'projects').first()
  const repos = projects?.items.map(item => item.repo) ?? []

  const entries = await Promise.all(repos.map(async (repo) => {
    try {
      const data = await $fetch(`https://api.github.com/repos/${repo}`, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'mhaibaraai.cn',
          ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {})
        }
      })
      const parsed = repoSchema.parse(data)
      const stats: RepoStats = { stars: parsed.stargazers_count, language: parsed.language, pushedAt: parsed.pushed_at }
      return [repo, stats] as const
    } catch (error) {
      console.warn(`[github] 获取 ${repo} 失败：`, error instanceof Error ? error.message : error)
      return undefined
    }
  }))

  return Object.fromEntries(entries.filter(entry => entry !== undefined)) as Record<string, RepoStats>
}, { maxAge: 60 * 60, name: 'github-repos' })
