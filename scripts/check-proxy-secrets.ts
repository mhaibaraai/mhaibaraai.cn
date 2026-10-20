import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

export type SecretRule = 'proxy-node' | 'subscription' | 'credential' | 'uuid'

export interface SecretFinding {
  rule: SecretRule
  line: number
  text: string
}

const PROXY_TYPES = 'ss|ssr|vmess|vless|trojan|snell|hysteria2?|tuic|wireguard|socks5(?:-tls)?|https?|shadowsocks|anytls'

const RULES: ReadonlyArray<{ rule: SecretRule, pattern: RegExp }> = [
  // Surge: Name = type, host, port, ...
  { rule: 'proxy-node', pattern: new RegExp(`=\\s*(?:${PROXY_TYPES})\\s*,\\s*[\\w.-]+\\s*,\\s*\\d+`, 'i') },
  // Quantumult X: type=host:port, ...
  { rule: 'proxy-node', pattern: new RegExp(`^\\s*(?:${PROXY_TYPES})\\s*=\\s*[\\w.-]+:\\d+`, 'i') },
  { rule: 'subscription', pattern: /\/(?:link|sub|subscribe|api\/v1\/client\/subscribe)\b[^\s,]*/i },
  { rule: 'credential', pattern: /\b(?:token|key|passwd|password|psk|auth)\s*=\s*[^\s,&]{4,}/i },
  { rule: 'uuid', pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i }
]

const COMMENT = /^\s*(?:#|;|\/\/)/
const PLACEHOLDER = /https?:\/\/(?:[\w-]+\.)?example\.(?:com|org)\S*|YOUR_[A-Z_]+|<[^>]+>/g

/** 扫描配置文本中的节点、订阅与凭据；跳过注释行，并先剔除占位符再匹配 */
export function findSecrets(content: string): SecretFinding[] {
  return content.split(/\r?\n/).flatMap((text, index) => {
    if (COMMENT.test(text)) return []
    const stripped = text.replace(PLACEHOLDER, '')
    const rules = new Set(RULES.filter(({ pattern }) => pattern.test(stripped)).map(({ rule }) => rule))
    return [...rules].map(rule => ({ rule, line: index + 1, text: text.trim() }))
  })
}

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? listFiles(path) : [path]
  })
}

export function scanDirectories(roots: readonly string[]): Array<SecretFinding & { file: string }> {
  return roots.flatMap(listFiles).flatMap(file =>
    findSecrets(readFileSync(file, 'utf8')).map(finding => ({ ...finding, file: relative(process.cwd(), file) }))
  )
}

function main(): void {
  const roots = ['../public/proxy', '../server/assets/rules'].map(dir => fileURLToPath(new URL(dir, import.meta.url)))
  const findings = scanDirectories(roots)

  if (!findings.length) {
    console.info(`[proxy] 已检查 ${roots.length} 个目录，未发现敏感信息`)
    return
  }

  for (const { file, line, rule, text } of findings) {
    console.error(`${file}:${line} [${rule}] ${text.slice(0, 120)}`)
  }
  console.error(`[proxy] 发现 ${findings.length} 处疑似敏感信息，请改用占位符后再提交`)
  process.exitCode = 1
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main()
}
