export default defineAppConfig({
  aiChat: {
    faqQuestions: [
      {
        category: 'Nuxt 实践',
        items: [
          'Nuxt SSR 模式怎么用 PM2 部署？',
          'Nuxt SEO 有哪些配置方案？',
          'LLMs.txt 如何在 Nuxt 中集成？'
        ]
      },
      {
        category: 'Vue 开发',
        items: [
          'Vue 3 自动导入怎么配置？',
          'Vue + UnoCSS 项目怎么集成 Nuxt UI？',
          'Vite 中怎么导入静态资源？'
        ]
      },
      {
        category: 'AI 工具',
        items: [
          'Claude Code Router 如何配置？',
          'OpenRouter API 怎么接入？',
          'Claude Code 个人配置有哪些推荐？'
        ]
      },
      {
        category: '部署运维',
        items: [
          '如何用 Docker 容器化部署项目？',
          'GitHub Actions + Watchtower 如何实现自动部署？',
          'GitLab CI/CD 怎么配置完整流水线？',
          'SSL 证书如何申请和配置？'
        ]
      },
      {
        category: '问题排查',
        items: [
          'ESM/CJS 兼容性问题怎么解决？',
          'Nuxt Layer 与 Reka UI 的 SSR 500 怎么排查？',
          'Vercel 部署 llms-full.txt 500 错误怎么解决？',
          'Nuxt UI 组件主题样式未生成怎么排查？'
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
