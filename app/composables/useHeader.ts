export function useHeader() {
  const route = useRoute()

  const desktopLinks = computed(() => [{
    label: '笔记',
    to: '/docs/ecosystem',
    active: route.path.startsWith('/docs/')
  }])

  const mobileLinks = computed(() => [{
    label: '语言与生态',
    icon: 'i-lucide-folder-code',
    to: '/docs/ecosystem',
    active: route.path.startsWith('/docs/ecosystem')
  }, {
    label: '实践指南',
    icon: 'i-lucide-rocket',
    to: '/docs/guides',
    active: route.path.startsWith('/docs/guides')
  }, {
    label: '工具集',
    icon: 'i-lucide-wrench',
    to: '/docs/tools',
    active: route.path.startsWith('/docs/tools')
  }, {
    label: 'GitHub',
    to: 'https://github.com/mhaibaraai/mhaibaraai.cn',
    icon: 'i-simple-icons-github',
    target: '_blank'
  }])

  return {
    desktopLinks,
    mobileLinks
  }
}
