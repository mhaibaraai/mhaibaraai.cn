export interface LlmsSource {
  title: string
  path: string
  rawbody: string
  description?: string
}

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/

export function stripFrontmatter(raw: string): string {
  return raw.trimStart().replace(FRONTMATTER, '').trim()
}

/** 以原始 Markdown 生成 llms-full.txt 中的单篇文档 */
export function toLlmsDocument(source: LlmsSource, domain: string): string {
  return [
    `# ${source.title}`,
    source.description && `> ${source.description}`,
    `Source: ${domain}${source.path}`,
    stripFrontmatter(source.rawbody)
  ].filter(Boolean).join('\n\n')
}
