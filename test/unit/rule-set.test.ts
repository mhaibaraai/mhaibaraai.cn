import { describe, expect, it } from 'vitest'
import { RULE_SET_NAME, toQuantumultX, toSurge } from '~~/shared/utils/rule-set'

const source = `# AI 服务
DOMAIN-SUFFIX,openai.com
DOMAIN,claude.ai
DOMAIN-KEYWORD,anthropic

IP-CIDR,1.2.3.0/24,no-resolve
IP-CIDR6,2001:db8::/32
USER-AGENT,Claude*`

describe('toSurge', () => {
  it('保留规则与注释，去除首尾空白', () => {
    expect(toSurge(`  ${source}  \n`)).toBe(`${source}\n`)
  })
})

describe('toQuantumultX', () => {
  it('转换为 QX 语法并附带策略', () => {
    expect(toQuantumultX(source, 'proxy').split('\n')).toEqual([
      '# AI 服务',
      'HOST-SUFFIX,openai.com,proxy',
      'HOST,claude.ai,proxy',
      'HOST-KEYWORD,anthropic,proxy',
      '',
      'IP-CIDR,1.2.3.0/24,proxy,no-resolve',
      'IP6-CIDR,2001:db8::/32,proxy',
      'USER-AGENT,Claude*,proxy',
      ''
    ])
  })

  it('不支持的规则类型抛错', () => {
    expect(() => toQuantumultX('PROCESS-NAME,Telegram', 'proxy')).toThrow(/PROCESS-NAME/)
  })
})

describe('RULE_SET_NAME', () => {
  it('只允许小写字母、数字与连字符', () => {
    expect(RULE_SET_NAME.test('ai')).toBe(true)
    expect(RULE_SET_NAME.test('dev-tools')).toBe(true)
    expect(RULE_SET_NAME.test('../secret')).toBe(false)
  })
})
