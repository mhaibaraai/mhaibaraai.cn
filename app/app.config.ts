export default defineAppConfig({
  aiChat: {
    faqQuestions: [
      {
        category: 'Nuxt 实践',
        items: [
          '如何将 Nuxt 部署到 Vercel？',
          'Nuxt SSR 模式怎么用 PM2 部署？',
          'Nuxt SEO 有哪些配置方案？',
          'LLMs.txt 如何在 Nuxt 中集成？'
        ]
      },
      {
        category: 'Vue 开发',
        items: [
          'Vue 3 自动导入怎么配置？',
          '如何按需引入 Element Plus？',
          '静态资源引用有哪几种方式？'
        ]
      },
      {
        category: '前端基础',
        items: [
          'Async/Await 常见陷阱有哪些？',
          'CSS 有哪些实用技巧？',
          'Fetch API 怎么封装？',
          'TypeScript declare global 怎么用？'
        ]
      },
      {
        category: 'AI 工具',
        items: [
          'Claude Code Router 如何配置？',
          'OpenRouter API 怎么接入？',
          'AI 辅助开发有哪些实践经验？'
        ]
      },
      {
        category: '部署运维',
        items: [
          '如何用 Docker 容器化部署项目？',
          'GitHub Actions CI/CD 怎么配置？',
          'SSL 证书如何申请和配置？',
          '钉钉机器人如何集成到工作流？'
        ]
      },
      {
        category: '问题排查',
        items: [
          'ESM/CJS 兼容性问题怎么解决？',
          'Nuxt Layer 与 Reka UI 的 SSR 异常',
          'Vercel 部署 LLMs 异常怎么排查？'
        ]
      }
    ]
  },
  header: {
    title: 'YiXuan'
  },
  ui: {
    colors: {
      primary: 'sky'
    },
    prose: {
      codeIcon: {
        sh: 'i-lucide:square-terminal',
        conf: 'i-lucide:file-braces-corner',
        dockerfile: 'i-vscode-icons:file-type-docker2'
      }
    }
  },
  toc: {
    bottom: {
      links: [
        {
          icon: 'i-lucide-message-circle-code',
          to: 'https://mhaibaraai.cn/llms.txt',
          target: '_blank',
          label: 'Open LLMs'
        }
      ]
    }
  },
  footer: {
    credits: `Copyright © 2024 - ${new Date().getFullYear()} YiXuan - <span class="text-highlighted">MIT License</span>`,
    socials: [
      {
        'icon': 'i-simple-icons-nuxt',
        'to': 'https://nuxt.com/',
        'target': '_blank',
        'aria-label': 'Nuxt Website'
      },
      {
        'icon': 'i-lucide-mail',
        'to': 'mailto:mhaibaraai@gmail.com',
        'target': '_blank',
        'aria-label': 'YiXuan\'s Gmail'
      }
    ]
  }
})
