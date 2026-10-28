import { z } from 'zod'

const LEVELS = ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'] as const

const responseSchema = z.object({
  data: z.object({
    user: z.object({
      contributionsCollection: z.object({
        contributionCalendar: z.object({
          totalContributions: z.number(),
          weeks: z.array(z.object({
            contributionDays: z.array(z.object({
              date: z.string(),
              contributionCount: z.number(),
              contributionLevel: z.enum(LEVELS)
            }))
          }))
        })
      })
    })
  })
})

export interface ContributionDay {
  date: string
  count: number
  level: number
}

export interface Contributions {
  total: number
  weeks: ContributionDay[][]
}

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`

/** 需要 NUXT_GITHUB_TOKEN；缺失时返回 null，页面隐藏热力图 */
export default defineCachedEventHandler(async (event): Promise<Contributions | null> => {
  const { githubToken } = useRuntimeConfig(event)
  if (!githubToken) return null

  try {
    const raw = await $fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${githubToken}`, 'User-Agent': 'mhaibaraai.cn' },
      body: { query: QUERY, variables: { login: 'mhaibaraai' } }
    })
    const calendar = responseSchema.parse(raw).data.user.contributionsCollection.contributionCalendar
    return {
      total: calendar.totalContributions,
      weeks: calendar.weeks.map(week => week.contributionDays.map(day => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVELS.indexOf(day.contributionLevel)
      })))
    }
  } catch (error) {
    console.warn('[github] 获取贡献数据失败：', error instanceof Error ? error.message : error)
    return null
  }
}, { maxAge: 60 * 60 * 6, name: 'github-contributions' })
