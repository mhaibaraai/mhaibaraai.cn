import { describe, expect, it } from 'vitest'
import { noteDate, sortNotesByDate } from '~~/shared/utils/notes'

describe('noteDate', () => {
  it('读取 meta.date', () => {
    expect(noteDate({ meta: { date: '2026-01-01T00:00:00Z' } })).toBe('2026-01-01T00:00:00Z')
  })

  it('缺失或类型不符时返回 undefined', () => {
    expect(noteDate({})).toBeUndefined()
    expect(noteDate({ meta: { date: 1 } })).toBeUndefined()
  })
})

describe('sortNotesByDate', () => {
  it('按日期倒序且不修改原数组', () => {
    const notes = [
      { id: 'a', meta: { date: '2025-01-01' } },
      { id: 'b' },
      { id: 'c', meta: { date: '2026-01-01' } }
    ]
    expect(sortNotesByDate(notes).map(note => note.id)).toEqual(['c', 'a', 'b'])
    expect(notes.map(note => note.id)).toEqual(['a', 'b', 'c'])
  })
})
