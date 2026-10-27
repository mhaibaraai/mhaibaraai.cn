interface MetaCarrier {
  meta?: Record<string, unknown>
}

/** docs 集合由 layer 定义，更新时间由 modules/content-git-date.ts 写入 meta.date */
export function noteDate(note: MetaCarrier): string | undefined {
  const date = note.meta?.date
  return typeof date === 'string' ? date : undefined
}

/** 按更新时间倒序，缺少日期的排在最后 */
export function sortNotesByDate<T extends MetaCarrier>(notes: readonly T[]): T[] {
  return [...notes].sort((a, b) => (noteDate(b) ?? '').localeCompare(noteDate(a) ?? ''))
}
