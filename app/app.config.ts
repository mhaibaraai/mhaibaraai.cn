export default defineAppConfig({
  toaster: {
    expand: true,
    position: 'top-right' as const,
    duration: 3000,
  },
  theme: {
    radius: 0.25,
    blackAsPrimary: false,
  },
  ui: {
    colors: {
      primary: 'indigo',
      neutral: 'zinc',
    },
    prose: {
      codeIcon: {
        'sh': 'material-icon-theme:console',
        'tsconfig.json': 'material-icon-theme:tsconfig',
        'ts': 'material-icon-theme:typescript',
        'scss': 'material-icon-theme:sass',
        'package.json': 'material-icon-theme:nodejs',
        'd.ts': 'material-icon-theme:typescript-def',
        'vite.config.ts': 'material-icon-theme:vite',
        'yml': 'material-icon-theme:yaml',
        'pnpm-workspace.yaml': 'material-icon-theme:pnpm-light',
        'ecosystem.config.cjs': 'material-icon-theme:pm2-ecosystem',
        'conf': 'material-icon-theme:settings',
        'tree': 'material-icon-theme:tree',
        '.env': 'material-icon-theme:tune',
        'java': 'material-icon-theme:java',
        'text': 'material-icon-theme:document',
        'json': 'material-icon-theme:json',
        'log': 'material-icon-theme:log',
        'js': 'material-icon-theme:javascript',
      },
    },
  },
  header: {
    github: 'https://github.com/mhaibaraai/mhaibaraai.cn/blob/main/content',
    colorMode: true,
    search: true,
    links: [
      {
        'icon': 'i-simple-icons-github',
        'to': 'https://github.com/mhaibaraai/mhaibaraai.cn',
        'target': '_blank',
        'aria-label': 'Open on GitHub',
      },
    ],
  },
  toc: {
    title: '页面导航',
    bottom: {
      title: '社区',
      edit: 'https://github.com/mhaibaraai/mhaibaraai.cn/edit/main/content',
      links: [
        {
          icon: 'i-lucide-star',
          label: 'Star on GitHub',
          to: 'https://github.com/mhaibaraai/mhaibaraai.cn',
          target: '_blank',
        },
        {
          icon: 'i-lucide-circle-dot',
          label: 'New Issue',
          to: 'https://github.com/mhaibaraai/mhaibaraai.cn/issues/new',
          target: '_blank',
        },
        {
          icon: 'i-lucide-brain',
          label: 'LLMs',
          to: 'https://mhaibaraai.cn/llms.txt',
          target: '_blank',
        },
        {
          icon: 'i-lucide-link',
          label: 'Link Checker',
          to: 'https://mhaibaraai.cn/__link-checker__/link-checker-report.html',
          target: '_blank',
        },
      ],
    },
  },
  footer: {
    credits: `Copyright © 2024 - ${new Date().getFullYear()} YiXuan`,
    links: [
      {
        'icon': 'i-tabler-brand-nuxt',
        'to': 'https://nuxt.com/',
        'target': '_blank',
        'aria-label': 'Nuxt Website',
      },
      {
        'icon': 'i-tabler-mail',
        'to': 'mailto:mhaibaraai@gmail.com',
        'target': '_blank',
        'aria-label': 'YiXuan\'s Gmail',
      },
      {
        'icon': 'i-lucide-brain',
        'to': 'https://mhaibaraai.cn/llms.txt',
        'target': '_blank',
        'aria-label': 'Open LLMs',
      },
      {
        'icon': 'i-lucide-link',
        'to': 'https://mhaibaraai.cn/__link-checker__/link-checker-report.html',
        'target': '_blank',
        'aria-label': 'Open Link Checker',
      },
      {
        'icon': 'i-simple-icons-github',
        'to': 'https://github.com/mhaibaraai/mhaibaraai.cn',
        'target': '_blank',
        'aria-label': 'Open on GitHub',
      },
    ],
  },
})
