/* global chrome */
const START_URL = 'https://mhaibaraai.cn/start'
const BOOKMARKS_URL = 'https://mhaibaraai.cn/api/bookmarks.json'
const CACHE_KEY = 'bookmarks'
const TIMEOUT_MS = 2500

const frame = document.getElementById('start')
const fallback = document.getElementById('fallback')
const container = document.getElementById('categories')

function isHttpUrl(value) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

function renderFallback(data) {
  const categories = Array.isArray(data?.categories) ? data.categories : []
  const sections = categories.map((category) => {
    const section = document.createElement('section')
    const heading = document.createElement('h2')
    heading.textContent = String(category.title ?? '')
    const list = document.createElement('ul')

    for (const item of category.items ?? []) {
      if (!isHttpUrl(item.url)) continue
      const li = document.createElement('li')
      const link = document.createElement('a')
      link.href = item.url
      link.textContent = String(item.title ?? item.url)
      li.append(link)
      list.append(li)
    }

    section.append(heading, list)
    return section
  })

  container.replaceChildren(...sections)
  fallback.hidden = false
}

async function fetchBookmarks() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(BOOKMARKS_URL, { signal: controller.signal, cache: 'no-cache' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

async function main() {
  try {
    const data = await fetchBookmarks()
    await chrome.storage.local.set({ [CACHE_KEY]: data })
    frame.src = START_URL
    frame.hidden = false
  } catch (error) {
    console.warn('[newtab] 站点不可用，使用缓存书签：', error)
    const cached = await chrome.storage.local.get(CACHE_KEY)
    renderFallback(cached[CACHE_KEY])
  }
}

main()
