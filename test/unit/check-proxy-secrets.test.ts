import { describe, expect, it } from 'vitest'
import { findSecrets } from '~~/scripts/check-proxy-secrets'

const surgeTemplate = `
[General]
loglevel = notify

[Proxy]
# 节点来自订阅，见 [Proxy Group]

[Proxy Group]
Proxy = select, policy-path=YOUR_SUBSCRIPTION_URL, update-interval=86400

[Rule]
RULE-SET,https://mhaibaraai.cn/proxy/rules/dev.list,Proxy
`

describe('findSecrets', () => {
  it('脱敏模板没有发现', () => {
    expect(findSecrets(surgeTemplate)).toEqual([])
  })

  it('检测 Surge 节点定义', () => {
    const found = findSecrets('[Proxy]\nHK 01 = ss, hk1.airport.net, 443, encrypt-method=aes-128-gcm, password=abc123')
    expect(found.map(f => f.rule)).toContain('proxy-node')
    expect(found[0]!.line).toBe(2)
  })

  it('检测 Quantumult X 节点定义', () => {
    expect(findSecrets('shadowsocks=1.2.3.4:443, method=chacha20, password=x, tag=JP').map(f => f.rule)).toContain('proxy-node')
    expect(findSecrets('trojan=jp.node.io:443, password=x, over-tls=true, tag=JP').map(f => f.rule)).toContain('proxy-node')
  })

  it('检测订阅链接与凭据参数', () => {
    expect(findSecrets('Proxy = select, policy-path=https://sub.airport.com/api/v1/client/subscribe?token=a1b2c3d4e5').map(f => f.rule))
      .toEqual(expect.arrayContaining(['subscription', 'credential']))
    expect(findSecrets('https://x.com/link/AbCdEf123456?clash=1').map(f => f.rule)).toContain('subscription')
  })

  it('检测 UUID', () => {
    expect(findSecrets('vmess=a.com:443, password=0b8f5a8e-6a3c-4f2b-9b1e-2a0f5e7c9d11').map(f => f.rule)).toContain('uuid')
  })

  it('忽略注释与占位符', () => {
    expect(findSecrets('# HK = ss, hk1.airport.net, 443, password=abc')).toEqual([])
    expect(findSecrets('; trojan=jp.node.io:443, password=x')).toEqual([])
    expect(findSecrets('policy-path=https://example.com/sub?token=YOUR_TOKEN')).toEqual([])
    expect(findSecrets('HK = ss, <server>, 443, password=<password>')).toEqual([])
  })

  it('同一行中占位符不会掩盖真实凭据', () => {
    expect(findSecrets('HK = ss, hk1.airport.net, 443, password=<password>').map(f => f.rule)).toContain('proxy-node')
    expect(findSecrets('tag=YOUR_TAG, password=realpass123').map(f => f.rule)).toContain('credential')
  })
})
