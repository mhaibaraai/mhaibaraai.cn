export default defineAppConfig({
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
          icon: 'i-lucide-brain',
          to: 'https://mhaibaraai.cn/llms.txt',
          target: '_blank',
          label: 'Open LLMs'
        },
        {
          icon: 'i-lucide-brain-circuit',
          to: 'https://mhaibaraai.cn/_llms-full.txt',
          target: '_blank',
          label: 'Open Full LLMs'
        },
        {
          icon: 'i-lucide-link',
          to: 'https://mhaibaraai.cn/__link-checker__/link-checker-report.html',
          target: '_blank',
          label: 'Open Link Checker'
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
