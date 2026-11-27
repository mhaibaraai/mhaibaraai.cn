import pkg from './package.json'

const SITE_URL = 'https://mhaibaraai.cn'
const SITE_NAME = 'YiXuan 的开发随笔'
const localD1Id = '00000000-0000-0000-0000-000000000000'
const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID || localD1Id

const movedNotes = {
  'nuxt/troubleshooting/nuxt-ui-component-detection': 'nuxt/nuxt-ui-component-detection',
  'nuxt/troubleshooting/self-hosted-oauth-500': 'nuxt/self-hosted-oauth-500',
  'guides/deployment/docker': 'deployment/docker',
  'guides/deployment/database': 'deployment/database',
  'guides/deployment/ssl-certificate': 'deployment/ssl-certificate',
  'guides/deployment/github-actions': 'deployment/github-actions',
  'guides/deployment/github-ci-mirror-acceleration': 'deployment/github-ci-mirror-acceleration',
  'guides/platforms/gitlab-ci': 'deployment/gitlab-ci',
  'guides/platforms/iserver': 'platforms/iserver',
  'guides/platforms/dingtalk': 'platforms/dingtalk',
  'tools/managers/pnpm': 'tools/pnpm'
}

const movedNoteRedirects = Object.fromEntries(
  Object.entries(movedNotes).flatMap(([from, to]) => [
    [`/docs/${from}`, { redirect: { to: `/docs/${to}`, statusCode: 301 }, prerender: false }],
    [`/raw/docs/${from}.md`, { redirect: { to: `/raw/docs/${to}.md`, statusCode: 301 }, prerender: false }]
  ])
)

export default defineNuxtConfig({
  extends: ['@movk/nuxt-docs'],

  modules: [
    '@nuxt/eslint'
  ],

  $production: {
    site: {
      url: SITE_URL
    },
    content: {
      database: { type: 'd1', bindingName: 'DB' }
    },
    nitro: {
      preset: 'cloudflare_module',
      cloudflare: {
        deployConfig: true,
        nodeCompat: true,
        wrangler: {
          d1_databases: [{
            binding: 'DB',
            database_name: 'mhaibaraai-cn-content',
            database_id: databaseId
          }]
        }
      },
      // Cloudflare merges matching headers. Set these cache headers in public/_headers in override order.
      routeRules: {
        '/_nuxt/**': { cache: { maxAge: 0 } },
        '/_nuxt/builds/**': { cache: { maxAge: 0 } },
        '/_nuxt/builds/meta/**': { cache: { maxAge: 0 } }
      }
    },
    hooks: {
      'nitro:build:before'() {
        if (process.env.WORKERS_CI === '1' && databaseId === localD1Id) {
          throw new Error('Set CLOUDFLARE_D1_DATABASE_ID in Workers Builds before deploying.')
        }
      }
    },
    ogImage: {
      buildCache: { base: 'node_modules/.cache/nuxt/og-image' }
    }
  },

  devtools: { enabled: true },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        { rel: 'alternate', type: 'application/rss+xml', title: SITE_NAME, href: '/rss.xml' }
      ]
    }
  },

  site: { name: SITE_NAME },

  content: {
    build: {
      markdown: {
        toc: { depth: 3 },
        highlight: {
          langs: ['bash', 'sh', 'shell', 'diff', 'json', 'jsonc', 'js', 'ts', 'tsx', 'html', 'css', 'scss', 'vue', 'mdc', 'md', 'yaml', 'toml', 'ini', 'java', 'xml', 'sql', 'dockerfile', 'nginx', 'properties']
        }
      }
    }
  },

  ui: {
    eslint: true,
    experimental: { componentDetection: true }
  },

  runtimeConfig: {
    public: {
      version: pkg.version
    }
  },

  routeRules: {
    '/start': { headers: { 'Content-Security-Policy': 'frame-ancestors \'self\' chrome-extension:' }, robots: false },
    ...movedNoteRedirects,
    '/docs': { redirect: '/docs/nuxt/nuxt-ui-component-detection', prerender: false },
    '/docs/nuxt': { redirect: '/docs/nuxt/nuxt-ui-component-detection', prerender: false },
    '/docs/deployment': { redirect: '/docs/deployment/docker', prerender: false },
    '/docs/platforms': { redirect: '/docs/platforms/iserver', prerender: false },
    '/docs/tools': { redirect: '/docs/tools/pnpm', prerender: false },
    '/docs/nuxt/troubleshooting': { redirect: '/docs/nuxt/nuxt-ui-component-detection', prerender: false },
    '/docs/guides': { redirect: '/docs/deployment/docker', prerender: false },
    '/docs/guides/deployment': { redirect: '/docs/deployment/docker', prerender: false },
    '/docs/guides/platforms': { redirect: '/docs/platforms/iserver', prerender: false },
    '/docs/tools/managers': { redirect: '/docs/tools/pnpm', prerender: false },
    '/config': { redirect: '/config/surge', prerender: false }
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    prerender: {
      routes: ['/rss.xml', '/api/bookmarks.json']
    }
  },

  aiChat: {
    enabled: false
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  llms: {
    domain: SITE_URL,
    title: SITE_NAME,
    description: '一个专注于技术分享与知识沉淀的个人网站。',
    full: {
      title: SITE_NAME,
      description: '一个专注于技术分享与知识沉淀的个人网站。从代码片段到架构思考，这里是我在成为更优秀全栈工程师路上的所有笔记。'
    },
    notes: ['技术分享', '知识沉淀', '开发随笔']
  },

  mcp: {
    name: 'mhaibaraai.cn',
    browserRedirect: '/docs'
  },

  robots: {
    disallow: ['/start']
  },

  sitemap: {
    exclude: ['/start']
  }
})
