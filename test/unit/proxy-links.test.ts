import { describe, expect, it } from 'vitest'
import { qxAddResourceUrl, surgeInstallUrl } from '~/utils/proxy-links'

describe('surgeInstallUrl', () => {
  it('编码配置地址', () => {
    expect(surgeInstallUrl('https://mhaibaraai.cn/proxy/surge/template.conf?v=1&a=b'))
      .toBe('surge:///install-config?url=https%3A%2F%2Fmhaibaraai.cn%2Fproxy%2Fsurge%2Ftemplate.conf%3Fv%3D1%26a%3Db')
  })

  it('拒绝非 https 地址', () => {
    expect(() => surgeInstallUrl('http://example.com/a.conf')).toThrow()
  })
})

describe('qxAddResourceUrl', () => {
  it('生成 add-resource 链接并携带 tag 与 policy', () => {
    const url = qxAddResourceUrl('filter_remote', [{ url: 'https://mhaibaraai.cn/proxy/rules/dev.list', tag: '开发', policy: 'Proxy' }])
    const [scheme, query] = url.split('?remote-resource=')
    expect(scheme).toBe('quantumult-x:///add-resource')
    expect(JSON.parse(decodeURIComponent(query!))).toEqual({
      filter_remote: ['https://mhaibaraai.cn/proxy/rules/dev.list, tag=开发, force-policy=Proxy, enabled=true']
    })
  })

  it('rewrite 资源不携带 force-policy', () => {
    const url = qxAddResourceUrl('rewrite_remote', [{ url: 'https://example.com/a.conf', tag: 'A' }])
    expect(decodeURIComponent(url)).toContain('"https://example.com/a.conf, tag=A, enabled=true"')
  })

  it('空列表抛错', () => {
    expect(() => qxAddResourceUrl('filter_remote', [])).toThrow()
  })
})
