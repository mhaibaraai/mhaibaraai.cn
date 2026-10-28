import { describe, expect, it } from 'vitest'
import { RULE_SET_NAME } from '~~/shared/utils/rule-set'
import { RULE_SETS, ruleSetUrl } from '~/utils/rule-sets'

describe('RULE_SETS', () => {
  it('名称合法且有对应规则源', async () => {
    const { existsSync } = await import('node:fs')
    for (const set of RULE_SETS) {
      expect(RULE_SET_NAME.test(set.name)).toBe(true)
      expect(existsSync(`server/assets/rules/${set.name}.list`)).toBe(true)
    }
  })

  it('拼接规则集地址', () => {
    expect(ruleSetUrl('https://mhaibaraai.cn', 'quantumult-x', 'ai')).toBe('https://mhaibaraai.cn/proxy/rules/quantumult-x/ai.list')
  })
})
