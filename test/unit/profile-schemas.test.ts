import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { describe, expect, it } from 'vitest'
import { friendsSchema, projectsSchema, shelfSchema, usesSchema } from '~~/shared/schemas/profile'

const load = (file: string): unknown => parse(readFileSync(`content/${file}`, 'utf8'))

describe('内容数据符合 schema', () => {
  it.each([
    ['uses.yml', usesSchema],
    ['projects.yml', projectsSchema],
    ['shelf.yml', shelfSchema],
    ['friends.yml', friendsSchema]
  ] as const)('%s', (file, schema) => {
    expect(schema.safeParse(load(file)).success).toBe(true)
  })
})

describe('schema 约束', () => {
  it('拒绝非法 repo 与日期', () => {
    expect(projectsSchema.safeParse({ items: [{ name: 'a', repo: 'not a repo', description: '' }] }).success).toBe(false)
    expect(shelfSchema.safeParse({ items: [{ title: 'a', type: 'book', status: 'done', date: '2026/01' }] }).success).toBe(false)
  })
})
