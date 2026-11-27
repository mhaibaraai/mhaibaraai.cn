import { expect, test } from '@playwright/test'

const featuredNote = '/docs/nuxt/nuxt-ui-component-detection'
const featuredRaw = `/raw${featuredNote}.md`

test('首页展示刊头与最近更新', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(/开发随笔/)
  await expect(page.getByText('本期要目')).toBeVisible()
  const firstLine = page.locator('ol').first().getByRole('link').first()
  const href = await firstLine.getAttribute('href')
  await firstLine.click()
  await expect(page).toHaveURL(href!)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('首页展示新栏目并链接到各栏目首篇', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('section').filter({ has: page.getByText('Sections / 栏目', { exact: true }) })
  const sections = [
    ['Nuxt 工程', featuredNote, 3],
    ['部署与运维', '/docs/deployment/docker', 6],
    ['平台集成', '/docs/platforms/iserver', 2],
    ['开发环境与工具', '/docs/tools/pnpm', 1]
  ] as const
  await expect(section.getByRole('link')).toHaveCount(sections.length)
  for (const [title, path, count] of sections) {
    const link = section.getByRole('link', { name: new RegExp(title) })
    await expect(link).toHaveAttribute('href', path)
    await expect(link).toContainText(`${count} 篇`)
  }
})

test('笔记页渲染正文与目录', async ({ page }) => {
  await page.goto(featuredNote)
  await expect(page.getByRole('heading', { level: 1, name: 'Nuxt UI componentDetection 漏检' })).toBeVisible()
  await expect(page.getByText('本文目录').filter({ visible: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Nuxt UI 官方文档' })).toHaveAttribute('href', /^https:\/\/ui\.nuxt\.com\//)
})

test('笔记入口重定向到首篇笔记', async ({ page }) => {
  await page.goto('/docs')
  await expect(page).toHaveURL(featuredNote)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('旧正文和原文地址跳转到同一篇文章', async ({ request }) => {
  const oldPath = '/docs/tools/managers/pnpm'
  const newPath = '/docs/tools/pnpm'
  for (const [from, to] of [[oldPath, newPath], [`/raw${oldPath}.md`, `/raw${newPath}.md`]] as const) {
    const response = await request.get(from, { maxRedirects: 0 })
    expect(response.status()).toBe(301)
    expect(response.headers().location).toBe(to)
    expect((await request.get(to, { maxRedirects: 0 })).ok()).toBe(true)
  }
  expect((await request.get('/docs/nuxt/seo')).status()).toBe(404)
})

test('书签页按关键词筛选', async ({ page }) => {
  await page.goto('/bookmarks')
  await page.getByRole('textbox', { name: '搜索书签' }).fill('regex')
  const main = page.getByRole('main')
  await expect(main.getByRole('link', { name: /Regex101/ })).toBeVisible()
  await expect(main.getByRole('link', { name: /GitHub/ })).toHaveCount(0)
})

test('起始页回车跳转到搜索引擎', async ({ page }) => {
  await page.route('https://www.google.com/**', route => route.fulfill({ body: 'ok' }))
  await page.goto('/start')
  const input = page.getByRole('textbox', { name: '搜索或输入网址' })
  await input.fill('nuxt content')
  await input.press('Enter')
  await expect(page).toHaveURL('https://www.google.com/search?q=nuxt%20content')
})

test('快捷键打开全站搜索', async ({ page }) => {
  await page.goto(featuredNote)
  await page.waitForLoadState('networkidle')
  // Desktop Chrome 预设为 Windows UA，Nuxt UI 据此将 meta_k 映射为 Ctrl+K
  await page.keyboard.press('Control+k')
  await expect(page.getByRole('dialog')).toBeVisible()
})

test('Surge 一键安装链接指向模板', async ({ page }) => {
  await page.goto('/config/surge')
  await expect(page.getByRole('link', { name: /一键安装配置/ })).toHaveAttribute('href', /^surge:\/\/\/install-config\?url=https%3A%2F%2Fmhaibaraai\.cn%2Fproxy%2Fsurge%2Ftemplate\.conf$/)
})

test('起始页允许被扩展内嵌', async ({ request }) => {
  const response = await request.get('/start')
  expect(response.headers()['content-security-policy']).toContain('chrome-extension:')
})

test('笔记提供 Markdown 原文', async ({ request }) => {
  const response = await request.get(featuredRaw)
  expect(response.ok()).toBe(true)
  expect(response.headers()['content-type']).toContain('text/markdown')
  const body = await response.text()
  expect(body).toContain('# Nuxt UI componentDetection 漏检')
  expect(body).toContain(`canonical_url: "https://mhaibaraai.cn${featuredNote}"`)
})

test('Markdown 发现入口包含现存笔记与配置页', async ({ request }) => {
  const index = await request.get('/llms.txt')
  expect(index.ok()).toBe(true)
  expect(await index.text()).toContain('/llms-full.txt')

  const sitemap = await request.get('/sitemap.md')
  expect(sitemap.ok()).toBe(true)
  const body = await sitemap.text()
  expect(body).toContain(featuredRaw)
  expect(body).not.toContain('/raw/docs/nuxt/seo.md')
  expect(body).toContain('/raw/config/surge.md')
})

test('站点地图列出新文章地址', async ({ request }) => {
  const response = await request.get('/sitemap.xml')
  expect(response.ok()).toBe(true)
  const body = await response.text()
  expect(body).toContain(featuredNote)
  expect(body).toContain('/docs/nuxt/self-hosted-oauth-500')
  expect(body).toContain('/docs/tools/pnpm</loc>')
  expect(body).not.toContain('/docs/work-summary')
  expect(body).not.toContain('/docs/nuxt/seo')
})

test('RSS 输出最近的笔记', async ({ request }) => {
  const response = await request.get('/rss.xml')
  expect(response.headers()['content-type']).toContain('application/rss+xml')
  const body = await response.text()
  expect(body).toContain('<title>YiXuan 的开发随笔</title>')
  expect(body.match(/<item>/g)?.length).toBeGreaterThan(0)
})

test('未知路径显示 404 页面', async ({ page }) => {
  const response = await page.goto('/not-exist-page')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('此页已被撕去')
})
