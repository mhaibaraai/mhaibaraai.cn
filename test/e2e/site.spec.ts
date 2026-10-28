import { expect, test } from '@playwright/test'

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

test('笔记页渲染正文与目录', async ({ page }) => {
  await page.goto('/docs/nuxt/seo')
  await expect(page.getByRole('heading', { level: 1, name: 'Nuxt SEO' })).toBeVisible()
  await expect(page.getByText('本文目录').filter({ visible: true })).toBeVisible()
})

test('旧分类路径重定向到首篇笔记', async ({ page }) => {
  await page.goto('/docs/vue')
  await expect(page).toHaveURL(/\/docs\/vue\/auto-import$/)
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
  await page.goto('/docs/nuxt/seo')
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
  const response = await request.get('/raw/docs/nuxt/seo.md')
  expect(response.ok()).toBe(true)
  expect(response.headers()['content-type']).toContain('text/markdown')
  expect(await response.text()).toContain('# Nuxt SEO')
})

test('llms.txt 列出笔记与配置页', async ({ request }) => {
  const body = await (await request.get('/llms.txt')).text()
  expect(body).toContain('/raw/docs/nuxt/seo.md')
  expect(body).toContain('/raw/config/surge.md')
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
