const nav = [
  { label: '笔记', to: '/docs', icon: 'i-lucide-notebook-pen' },
  { label: '书签', to: '/bookmarks', icon: 'i-lucide-bookmark' },
  { label: '配置', to: '/config', icon: 'i-lucide-sliders-horizontal' },
  { label: '项目', to: '/projects', icon: 'i-lucide-folder-git-2' }
]

const navMore = [
  { label: 'Now', to: '/now', icon: 'i-lucide-radio', description: '最近在做什么' },
  { label: 'Uses', to: '/uses', icon: 'i-lucide-laptop', description: '装备与软件' },
  { label: '书影音', to: '/shelf', icon: 'i-lucide-library', description: '读过、看过、听过' },
  { label: '友链', to: '/friends', icon: 'i-lucide-link', description: '朋友们的站点' },
  { label: '留言板', to: '/guestbook', icon: 'i-lucide-message-square-quote', description: '留下点什么' }
]

export default defineAppConfig({
  site: {
    author: 'YiXuan',
    tagline: '开发随笔',
    since: 2024
  },
  giscus: {
    repo: 'mhaibaraai/mhaibaraai.cn',
    repoId: 'R_kgDOPjxlnw',
    category: 'Guestbook',
    /** 开启仓库 Discussions 并安装 giscus app 后，从 https://giscus.app 获取 */
    categoryId: ''
  },
  nav,
  navMore,
  socials: [
    { label: 'GitHub', icon: 'i-simple-icons-github', to: 'https://github.com/mhaibaraai' },
    { label: 'Email', icon: 'i-lucide-mail', to: 'mailto:mhaibaraai@gmail.com' },
    { label: 'RSS', icon: 'i-lucide-rss', to: '/rss.xml' },
    { label: 'LLMs', icon: 'i-lucide-bot', to: '/llms.txt' }
  ],
  seo: {
    titleTemplate: '%s · YiXuan 的开发随笔',
    title: 'YiXuan 的开发随笔',
    description: '一个专注于技术分享与知识沉淀的个人网站。'
  },
  header: {
    title: 'YiXuan',
    nav: nav.map(link => ({ ...link, activeMatch: link.to })),
    mobileNav: [...nav, ...navMore].map(({ label, to, icon }) => ({ label, to, icon }))
  },
  github: {
    dateFormat: {
      options: {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timeZone: 'Asia/Shanghai'
      }
    }
  },
  toc: {
    title: '本文目录',
    bottom: {
      links: [
        { icon: 'i-lucide-rss', to: '/rss.xml', target: '_blank', label: 'RSS 订阅' },
        { icon: 'i-lucide-message-circle-code', to: '/llms.txt', target: '_blank', label: 'Open LLMs' }
      ]
    }
  },
  ui: {
    prose: {
      codeIcon: {
        sh: 'i-lucide:square-terminal',
        conf: 'i-lucide:file-braces-corner',
        dockerfile: 'i-vscode-icons:file-type-docker2'
      }
    }
  }
})
