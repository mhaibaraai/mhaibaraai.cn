import pkg from './package.json'

const SITE_URL = 'https://mhaibaraai.cn'
const SITE_NAME = 'YiXuan 的开发随笔'
const SITE_DESCRIPTION = '一个专注于技术分享与知识沉淀的个人网站。'

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxt/image',
    '@vueuse/nuxt',
    'motion-v/nuxt',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    'nuxt-llms',
    '@vercel/analytics',
    '@vercel/speed-insights'
  ],

  $development: {
    site: { url: 'http://localhost:3000' }
  },

  devtools: { enabled: true },

  app: {
    rootAttrs: { 'data-vaul-drawer-wrapper': '' },
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        { rel: 'alternate', type: 'application/rss+xml', title: SITE_NAME, href: '/rss.xml' },
        { rel: 'preconnect', href: 'https://cdn.mhaibaraai.cn', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://cdn.mhaibaraai.cn/fonts/alibaba-puhuiti.css' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  site: {
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    defaultLocale: 'zh-CN'
  },

  content: {
    experimental: { sqliteConnector: 'native' },
    build: {
      markdown: {
        toc: { depth: 3 },
        highlight: {
          theme: { default: 'github-light', dark: 'github-dark' },
          langs: ['bash', 'sh', 'shell', 'diff', 'json', 'jsonc', 'js', 'ts', 'tsx', 'html', 'css', 'scss', 'vue', 'mdc', 'md', 'yaml', 'toml', 'ini', 'java', 'xml', 'sql', 'dockerfile', 'nginx', 'properties']
        },
        remarkPlugins: {
          'remark-mdc': { options: { autoUnwrap: true } }
        }
      }
    }
  },

  ui: {
    fonts: false,
    theme: {
      colors: ['primary', 'secondary', 'info', 'success', 'warning', 'error', 'neutral']
    }
  },

  runtimeConfig: {
    githubToken: '',
    public: {
      version: pkg.version,
      siteUrl: SITE_URL
    }
  },

  routeRules: {
    '/start': { headers: { 'Content-Security-Policy': 'frame-ancestors \'self\' chrome-extension:' }, robots: false },
    // redirects - default root pages
    '/docs': { redirect: '/docs/fundamentals', prerender: false },
    '/docs/fundamentals': { redirect: '/docs/fundamentals/async-await', prerender: false },
    '/docs/vue': { redirect: '/docs/vue/auto-import', prerender: false },
    '/docs/vue/troubleshooting': { redirect: '/docs/vue/troubleshooting/common', prerender: false },
    '/docs/nuxt': { redirect: '/docs/nuxt/copy-page', prerender: false },
    '/docs/nuxt/troubleshooting': { redirect: '/docs/nuxt/troubleshooting/node-version-compatibility', prerender: false },
    '/docs/java': { redirect: '/docs/java/global-cache', prerender: false },
    '/docs/guides': { redirect: '/docs/guides/linux', prerender: false },
    '/docs/guides/deployment': { redirect: '/docs/guides/deployment/docker', prerender: false },
    '/docs/guides/platforms': { redirect: '/docs/guides/platforms/dingtalk', prerender: false },
    '/docs/tools': { redirect: '/docs/tools/managers', prerender: false },
    '/docs/tools/managers': { redirect: '/docs/tools/managers/homebrew', prerender: false },
    '/docs/tools/version-control': { redirect: '/docs/tools/version-control/fnm', prerender: false },
    '/docs/work-summary': { redirect: '/docs/work-summary/2025', prerender: false },
    '/config': { redirect: '/config/surge', prerender: false }
  },

  experimental: {
    viewTransition: true,
    defaults: {
      nuxtLink: { externalRelAttribute: 'noopener' }
    }
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    sourceMap: false,
    prerender: {
      routes: ['/', '/rss.xml', '/api/bookmarks.json'],
      crawlLinks: true,
      failOnError: false,
      autoSubfolderIndex: false
    }
  },

  vite: {
    build: { sourcemap: false }
  },

  telemetry: false,

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  icon: {
    clientBundle: {
      scan: { globInclude: ['**/*.{vue,ts,md,yml}'] }
    }
  },

  llms: {
    domain: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    sections: [
      { title: '笔记', contentCollection: 'docs' },
      { title: '配置', contentCollection: 'config' }
    ],
    full: {
      title: SITE_NAME,
      description: '一个专注于技术分享与知识沉淀的个人网站。从代码片段到架构思考，这里是我在成为更优秀全栈工程师路上的所有笔记。'
    },
    notes: ['技术分享', '知识沉淀', '开发随笔']
  },

  robots: {
    disallow: ['/api/', '/start']
  },

  sitemap: {
    exclude: ['/start']
  }
})
