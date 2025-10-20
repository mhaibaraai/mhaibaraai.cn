import { definePerson } from 'nuxt-schema-org/schema'

export default defineNuxtConfig({
  extends: ['@movk/nuxt-docs'],
  modules: ['@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  site: {
    url: 'https://mhaibaraai.cn',
    name: 'YiXuan 的开发随笔',
    logo: '/avatar.png',
    description: '一个专注于技术分享与知识沉淀的个人网站。',
  },
  routeRules: {
    // redirects - default root pages
    '/docs': { redirect: '/docs/getting-started', prerender: false }
  },
  compatibilityDate: 'latest',
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
