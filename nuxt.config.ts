import { definePerson } from 'nuxt-schema-org/schema'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxtjs/seo',
    'nuxt-llms',
    'motion-v/nuxt',
    '@vueuse/nuxt',
    '@nuxt/ui',
    '@nuxt/content',
  ],
  css: ['~/assets/css/main.css'],
  site: {
    url: 'https://mhaibaraai.cn',
    name: 'YiXuan 的开发随笔',
    logo: '/avatar.png',
    description: '一个专注于技术分享与知识沉淀的个人网站。',
    defaultLocale: 'zh-CN',
  },
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark',
            sepia: 'monokai',
          },
          langs: ['json', 'js', 'ts', 'html', 'css', 'vue', 'shell', 'mdc', 'md', 'yaml', 'sh'],
        },
      },
    },
  },
  runtimeConfig: {
    public: {
      url: 'https://mhaibaraai.cn',
    },
  },
  compatibilityDate: '2025-07-28',
  // https://nitro.build/config
  nitro: {
    prerender: {
      routes: ['/', '/sitemap.xml', '/robots.txt', '/404.html'],
      crawlLinks: true,
      autoSubfolderIndex: false,
    },
  },
  eslint: {
    config: {
      standalone: false,
      nuxt: {
        sortConfigKeys: true,
      },
    },
  },
  linkChecker: {
    report: {
      publish: true,
      html: true,
      markdown: true,
      json: true,
    },
  },
  llms: {
    domain: 'https://mhaibaraai.cn',
    title: 'YiXuan 的开发随笔',
    description: '一个专注于技术分享与知识沉淀的个人网站。',
    full: {
      title: 'YiXuan 的开发随笔',
      description: '一个专注于技术分享与知识沉淀的个人网站。从代码片段到架构思考，这里是我在成为更优秀全栈工程师路上的所有笔记。',
    },
    notes: ['技术分享', '知识沉淀', '开发随笔'],
  },
  ogImage: {
    googleFontMirror: true,
    fonts: [
      'Noto+Sans+SC:400',
    ],
  },
  robots: {
    sitemap: 'https://mhaibaraai.cn/sitemap.xml',
  },
  schemaOrg: {
    identity: definePerson({
      name: 'YiXuan',
      image: '/avatar.png',
      url: 'https://mhaibaraai.cn',
      description: '一个专注于技术分享与知识沉淀的个人网站。',
      email: 'mhaibaraai@gmail.com',
      sameAs: [
        'https://github.com/mhaibaraai',
      ],
    }),
  },
})
