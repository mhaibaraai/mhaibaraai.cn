export default defineAppConfig({
  vercelAnalytics: {
    enable: true,
    debug: false
  },
  aiChat: {
    faqQuestions: [
      {
        category: 'Nuxt 实践',
        items: [
          'Nuxt 4 部署到 Vercel',
          'Nuxt SSR 使用 PM2 部署',
          'Nuxt SEO 优化方案',
          'LLMs.txt 如何集成？'
        ]
      },
      {
        category: 'Vue 开发',
        items: [
          'Vue 3 自动导入配置',
          'Element Plus 按需引入',
          'Async/Await 最佳实践'
        ]
      },
      {
        category: 'AI 工具',
        items: [
          'Claude Code Router 使用',
          'OpenRouter API 接入',
          'AI 辅助开发实践'
        ]
      },
      {
        category: '部署配置',
        items: [
          'Docker 容器化部署',
          'PostgreSQL 数据库配置',
          'SSL 证书申请配置',
          '钉钉机器人集成'
        ]
      },
      {
        category: '开发环境',
        items: [
          'macOS 开发环境搭建',
          'FNM 管理 Node 版本',
          'pnpm 包管理器使用',
          'Git 常用操作'
        ]
      },
      {
        category: '问题排查',
        items: [
          'Nuxt 4 CommonJS 兼容性',
          'Node 版本兼容问题',
          'Vercel LLMs 部署异常'
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
    pageHero: {
      slots: {
        container: 'lg:py-20'
      }
    },
    pageSection: {
      slots: {
        container: 'lg:py-20'
      }
    },
    prose: {
      codeIcon: {
        sh: 'i-tabler-brand-tabler',
        conf: 'i-tabler-file-code'
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
