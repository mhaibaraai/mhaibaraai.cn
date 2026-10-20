export type QxResourceType = 'filter_remote' | 'rewrite_remote' | 'server_remote'

export interface QxResource {
  url: string
  tag: string
  /** 仅 filter_remote 生效 */
  policy?: string
}

function assertHttps(url: string): void {
  if (new URL(url).protocol !== 'https:') throw new Error(`仅支持 https 地址：${url}`)
}

/** Surge 一键安装托管配置 */
export function surgeInstallUrl(configUrl: string): string {
  assertHttps(configUrl)
  return `surge:///install-config?url=${encodeURIComponent(configUrl)}`
}

/** Quantumult X 一键添加远程资源 */
export function qxAddResourceUrl(type: QxResourceType, resources: readonly QxResource[]): string {
  if (!resources.length) throw new Error('至少需要一个资源')

  const lines = resources.map(({ url, tag, policy }) => {
    assertHttps(url)
    const parts = [url, `tag=${tag}`]
    if (type === 'filter_remote' && policy) parts.push(`force-policy=${policy}`)
    parts.push('enabled=true')
    return parts.join(', ')
  })

  return `quantumult-x:///add-resource?remote-resource=${encodeURIComponent(JSON.stringify({ [type]: lines }))}`
}
