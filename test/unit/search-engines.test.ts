import { describe, expect, it } from 'vitest'
import { SEARCH_ENGINES, resolveSearchTarget } from '~/utils/search-engines'

describe('resolveSearchTarget', () => {
  const google = SEARCH_ENGINES.find(e => e.id === 'google')!

  it('普通关键词拼接到引擎地址并编码', () => {
    expect(resolveSearchTarget('nuxt content & ui', google)).toBe('https://www.google.com/search?q=nuxt%20content%20%26%20ui')
  })

  it('完整 URL 直接跳转', () => {
    expect(resolveSearchTarget('https://nuxt.com/docs', google)).toBe('https://nuxt.com/docs')
  })

  it('裸域名补全 https', () => {
    expect(resolveSearchTarget('github.com/nuxt', google)).toBe('https://github.com/nuxt')
    expect(resolveSearchTarget('localhost:3000', google)).toBe('http://localhost:3000')
  })

  it('含空格或无点号的文本视为关键词', () => {
    expect(resolveSearchTarget('vue.js 教程', google)).toContain('/search?q=')
    expect(resolveSearchTarget('pnpm', google)).toContain('/search?q=pnpm')
  })

  it('空白输入返回 undefined', () => {
    expect(resolveSearchTarget('   ', google)).toBeUndefined()
  })

  it('引擎 id 唯一', () => {
    expect(new Set(SEARCH_ENGINES.map(e => e.id)).size).toBe(SEARCH_ENGINES.length)
  })
})
