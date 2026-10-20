import { describe, expect, it } from 'vitest'
import { readingMinutes } from '~/utils/reading'

describe('readingMinutes', () => {
  it('中文按 400 字/分钟', () => {
    expect(readingMinutes('字'.repeat(1200))).toBe(3)
  })

  it('英文按 220 词/分钟', () => {
    expect(readingMinutes('word '.repeat(440))).toBe(2)
  })

  it('代码块按 1/3 权重', () => {
    expect(readingMinutes(`\`\`\`ts\n${'const a = 1\n'.repeat(660)}\`\`\``)).toBe(3)
  })

  it('最少 1 分钟', () => {
    expect(readingMinutes('')).toBe(1)
  })
})
