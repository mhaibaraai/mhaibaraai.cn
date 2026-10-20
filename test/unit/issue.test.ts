import { describe, expect, it } from 'vitest'
import { formatLongDate, formatShortDate, getIssue, isoWeek } from '~/utils/issue'

describe('isoWeek', () => {
  it('处理跨年周', () => {
    expect(isoWeek(new Date(2026, 0, 1))).toBe(1)
    expect(isoWeek(new Date(2027, 0, 1))).toBe(53)
    expect(isoWeek(new Date(2026, 9, 20))).toBe(43)
  })
})

describe('getIssue', () => {
  it('以建站年为第 1 卷', () => {
    expect(getIssue(new Date(2026, 9, 20), 2024)).toEqual({ volume: 3, number: 43, label: 'Vol.03 · No.43' })
  })

  it('卷号最小为 1', () => {
    expect(getIssue(new Date(2023, 5, 1), 2024).volume).toBe(1)
  })
})

describe('formatShortDate / formatLongDate', () => {
  it('格式化 ISO 字符串', () => {
    expect(formatShortDate('2026-04-04T10:00:00+08:00')).toBe('2026.04.04')
  })

  it('空值与非法日期返回空串', () => {
    expect(formatShortDate(undefined)).toBe('')
    expect(formatShortDate('not-a-date')).toBe('')
  })

  it('长日期包含星期', () => {
    expect(formatLongDate(new Date(2026, 9, 20))).toBe('2026年10月20日星期二')
  })
})
