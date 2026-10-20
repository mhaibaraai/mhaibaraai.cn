/** 规则集文件名白名单，防止路径穿越 */
export const RULE_SET_NAME = /^[a-z0-9-]+$/

const QX_TYPES: Readonly<Record<string, string>> = {
  'DOMAIN-SUFFIX': 'HOST-SUFFIX',
  'DOMAIN': 'HOST',
  'DOMAIN-KEYWORD': 'HOST-KEYWORD',
  'IP-CIDR': 'IP-CIDR',
  'IP-CIDR6': 'IP6-CIDR',
  'USER-AGENT': 'USER-AGENT'
}

function lines(source: string): string[] {
  return source.trim().split(/\r?\n/).map(line => line.trim())
}

/** 规则源即 Surge 格式，仅做规范化 */
export function toSurge(source: string): string {
  return `${lines(source).join('\n')}\n`
}

/** 将 Surge 规则转换为 Quantumult X filter 语法 */
export function toQuantumultX(source: string, policy: string): string {
  const converted = lines(source).map((line) => {
    if (!line || line.startsWith('#')) return line
    const [type = '', value = '', ...options] = line.split(',').map(part => part.trim())
    const qxType = QX_TYPES[type]
    if (!qxType) throw new Error(`Quantumult X 不支持的规则类型：${type}`)
    return [qxType, value, policy, ...options].join(',')
  })
  return `${converted.join('\n')}\n`
}
