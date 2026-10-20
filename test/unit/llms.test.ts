import { describe, expect, it } from 'vitest'
import { stripFrontmatter, toLlmsDocument } from '~~/shared/utils/llms'

describe('stripFrontmatter', () => {
  it('移除开头的 frontmatter', () => {
    expect(stripFrontmatter('---\ntitle: A\n---\n\n## 正文')).toBe('## 正文')
  })

  it('没有 frontmatter 时原样返回（去除首尾空白）', () => {
    expect(stripFrontmatter('\n## 正文\n')).toBe('## 正文')
  })

  it('不误删正文中的分隔线', () => {
    expect(stripFrontmatter('段落\n\n---\n\n段落')).toBe('段落\n\n---\n\n段落')
  })
})

describe('toLlmsDocument', () => {
  it('拼接标题、描述、来源链接与正文', () => {
    const doc = toLlmsDocument({
      title: 'Nuxt SEO',
      description: 'SEO 指南',
      path: '/docs/nuxt/seo',
      rawbody: '---\ntitle: Nuxt SEO\n---\n\n## 安装'
    }, 'https://mhaibaraai.cn')
    expect(doc).toBe('# Nuxt SEO\n\n> SEO 指南\n\nSource: https://mhaibaraai.cn/docs/nuxt/seo\n\n## 安装')
  })

  it('缺少描述时省略引用行', () => {
    expect(toLlmsDocument({ title: 'A', path: '/a', rawbody: 'x' }, 'https://e.com')).toBe('# A\n\nSource: https://e.com/a\n\nx')
  })
})
