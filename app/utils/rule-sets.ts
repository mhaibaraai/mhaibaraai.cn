export interface RuleSetMeta {
  name: string
  title: string
  description: string
  policy: string
  qxPolicy: string
}

export const RULE_SETS: readonly RuleSetMeta[] = [
  { name: 'ai', title: 'AI', description: 'Claude、ChatGPT、Gemini、OpenRouter 等 AI 服务', policy: 'AI', qxPolicy: 'AI' },
  { name: 'dev', title: 'Dev', description: 'GitHub、npm、Docker、Vercel 等开发平台', policy: 'Proxy', qxPolicy: 'Proxy' },
  { name: 'direct', title: 'Direct', description: '国内常用服务与局域网地址强制直连', policy: 'DIRECT', qxPolicy: 'direct' }
]

export function ruleSetUrl(siteUrl: string, client: 'surge' | 'quantumult-x', name: string): string {
  return `${siteUrl}/proxy/rules/${client}/${name}.list`
}
