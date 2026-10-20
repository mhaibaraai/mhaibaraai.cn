export interface SearchEngine {
  id: string
  label: string
  icon: string
  url: string
}

export const SEARCH_ENGINES: readonly SearchEngine[] = [
  { id: 'google', label: 'Google', icon: 'i-simple-icons-google', url: 'https://www.google.com/search?q=' },
  { id: 'bing', label: 'Bing', icon: 'i-lucide-search', url: 'https://www.bing.com/search?q=' },
  { id: 'github', label: 'GitHub', icon: 'i-simple-icons-github', url: 'https://github.com/search?type=repositories&q=' },
  { id: 'npm', label: 'npm', icon: 'i-simple-icons-npm', url: 'https://www.npmjs.com/search?q=' },
  { id: 'mdn', label: 'MDN', icon: 'i-simple-icons-mdnwebdocs', url: 'https://developer.mozilla.org/zh-CN/search?q=' },
  { id: 'bilibili', label: 'Bilibili', icon: 'i-simple-icons-bilibili', url: 'https://search.bilibili.com/all?keyword=' }
]

const PROTOCOL = /^[a-z][\w+.-]*:\/\//i
const LOCAL_HOST = /^(?:localhost|127\.0\.0\.1|\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?(?:\/\S*)?$/
const BARE_DOMAIN = /^[\w-]+(?:\.[\w-]+)*\.[a-z]{2,}(?::\d+)?(?:\/\S*)?$/i

/** 输入为网址时直接跳转，否则交给搜索引擎 */
export function resolveSearchTarget(input: string, engine: SearchEngine): string | undefined {
  const value = input.trim()
  if (!value) return undefined
  if (PROTOCOL.test(value)) return value
  if (LOCAL_HOST.test(value)) return `http://${value}`
  if (BARE_DOMAIN.test(value)) return `https://${value}`
  return `${engine.url}${encodeURIComponent(value)}`
}
