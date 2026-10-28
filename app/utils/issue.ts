export interface Issue {
  volume: number
  number: number
  label: string
}

const DAY_MS = 86_400_000

/** ISO 8601 周序号 */
export function isoWeek(date: Date): number {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = target.getUTCDay() || 7
  target.setUTCDate(target.getUTCDate() + 4 - day)
  const yearStart = Date.UTC(target.getUTCFullYear(), 0, 1)
  return Math.ceil(((target.getTime() - yearStart) / DAY_MS + 1) / 7)
}

/** 以建站年份为第 1 卷、ISO 周为期号，生成刊头信息 */
export function getIssue(date: Date, sinceYear: number): Issue {
  const volume = Math.max(1, date.getFullYear() - sinceYear + 1)
  const number = isoWeek(date)
  return {
    volume,
    number,
    label: `Vol.${String(volume).padStart(2, '0')} · No.${String(number).padStart(2, '0')}`
  }
}

const dateFormatter = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
const shortFormatter = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })

export function formatLongDate(date: Date): string {
  return dateFormatter.format(date)
}

export function formatShortDate(value: string | Date | undefined): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  return Number.isNaN(date.getTime()) ? '' : shortFormatter.format(date).replaceAll('/', '.')
}
