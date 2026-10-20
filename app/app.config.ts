export default defineAppConfig({
  site: {
    author: 'YiXuan',
    tagline: '开发随笔',
    since: 2024,
    github: {
      owner: 'mhaibaraai',
      repo: 'mhaibaraai.cn',
      branch: 'main'
    }
  },
  nav: [
    { label: '笔记', to: '/docs', icon: 'i-lucide-notebook-pen' },
    { label: '书签', to: '/bookmarks', icon: 'i-lucide-bookmark' },
    { label: '配置', to: '/config', icon: 'i-lucide-sliders-horizontal' },
    { label: '项目', to: '/projects', icon: 'i-lucide-folder-git-2' }
  ],
  navMore: [
    { label: 'Now', to: '/now', icon: 'i-lucide-radio', description: '最近在做什么' },
    { label: 'Uses', to: '/uses', icon: 'i-lucide-laptop', description: '装备与软件' },
    { label: '书影音', to: '/shelf', icon: 'i-lucide-library', description: '读过、看过、听过' },
    { label: '友链', to: '/friends', icon: 'i-lucide-link', description: '朋友们的站点' },
    { label: '留言板', to: '/guestbook', icon: 'i-lucide-message-square-quote', description: '留下点什么' }
  ],
  socials: [
    { label: 'GitHub', icon: 'i-simple-icons-github', to: 'https://github.com/mhaibaraai' },
    { label: 'Email', icon: 'i-lucide-mail', to: 'mailto:mhaibaraai@gmail.com' },
    { label: 'RSS', icon: 'i-lucide-rss', to: '/rss.xml' },
    { label: 'LLMs', icon: 'i-lucide-bot', to: '/llms.txt' }
  ],
  ui: {
    colors: {
      primary: 'vermilion',
      neutral: 'stone'
    },
    prose: {
      codeIcon: {
        sh: 'i-lucide:square-terminal',
        conf: 'i-lucide:file-braces-corner',
        dockerfile: 'i-vscode-icons:file-type-docker2'
      }
    }
  }
})
