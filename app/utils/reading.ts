const CJK_PER_MINUTE = 400
const WORDS_PER_MINUTE = 220
const CODE_BLOCK = /```[\s\S]*?```/g
const CJK_CHAR = /[㐀-鿿豈-﫿]/g
const LATIN_WORD = /[A-Z0-9]+(?:['-][A-Z0-9]+)*/gi

/** 估算阅读分钟数：中文按字计、英文按词计，代码块按 1/3 权重 */
export function readingMinutes(markdown: string): number {
  const code = (markdown.match(CODE_BLOCK) ?? []).join('\n')
  const prose = markdown.replace(CODE_BLOCK, '')
  const minutes = (text: string) =>
    (text.match(CJK_CHAR)?.length ?? 0) / CJK_PER_MINUTE
    + (text.replace(CJK_CHAR, ' ').match(LATIN_WORD)?.length ?? 0) / WORDS_PER_MINUTE
  return Math.max(1, Math.round(minutes(prose) + minutes(code) / 3))
}
