import { definePerson } from 'nuxt-schema-org/schema'

export default defineNuxtConfig({
  extends: ['@movk/nuxt-docs'],
  modules: ['@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  site: {
    url: 'https://mhaibaraai.cn',
    name: 'YiXuan 的开发随笔',
    logo: '/avatar.png',
    description: '一个专注于技术分享与知识沉淀的个人网站。'
  },
  routeRules: {
    // redirects - default root pages
    '/docs': { redirect: '/docs/ecosystem', prerender: false },
    '/docs/ecosystem': { redirect: '/docs/ecosystem/async-await', prerender: false },
    '/docs/ecosystem/vue': { redirect: '/docs/ecosystem/vue/auto-import', prerender: false },
    '/docs/ecosystem/nuxt': { redirect: '/docs/ecosystem/nuxt/copy-page', prerender: false },
    '/docs/ecosystem/java': { redirect: '/docs/ecosystem/java/mac-install', prerender: false },
    '/docs/guides': { redirect: '/docs/guides/linux', prerender: false },
    '/docs/guides/deployment': { redirect: '/docs/guides/deployment/digitalocean', prerender: false },
    '/docs/guides/platforms': { redirect: '/docs/guides/platforms/dingtalk', prerender: false },
    '/docs/tools': { redirect: '/docs/tools/managers', prerender: false },
    '/docs/tools/managers': { redirect: '/docs/tools/managers/homebrew', prerender: false },
    '/docs/tools/version-control': { redirect: '/docs/tools/version-control/fnm', prerender: false }
  },
  compatibilityDate: 'latest',
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  llms: {
    domain: 'https://mhaibaraai.cn',
    title: 'YiXuan 的开发随笔',
    description: '一个专注于技术分享与知识沉淀的个人网站。',
    full: {
      title: 'YiXuan 的开发随笔',
      description: '一个专注于技术分享与知识沉淀的个人网站。从代码片段到架构思考，这里是我在成为更优秀全栈工程师路上的所有笔记。'
    },
    notes: ['技术分享', '知识沉淀', '开发随笔']
  },
  robots: {
    sitemap: 'https://mhaibaraai.cn/sitemap.xml'
  },
  schemaOrg: {
    identity: definePerson({
      name: 'YiXuan',
      image: '/avatar.png',
      url: 'https://mhaibaraai.cn',
      description: '一个专注于技术分享与知识沉淀的个人网站。',
      email: 'mhaibaraai@gmail.com',
      sameAs: [
        'https://github.com/mhaibaraai'
      ]
    })
  }
})
