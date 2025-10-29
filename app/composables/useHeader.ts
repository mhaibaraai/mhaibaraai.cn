export function useHeader() {
  const route = useRoute()

  const desktopLinks = computed(() => [{
    label: '笔记',
    to: '/docs/fundamentals',
    active: route.path.startsWith('/docs/')
  }])

  const mobileLinks = computed(() => [{
    label: '前端基础',
    icon: 'i-lucide-square-code',
    to: '/docs/fundamentals',
    active: route.path.startsWith('/docs/fundamentals')
  }, {
    label: 'Vue',
    icon: 'i-tabler-brand-vue',
    to: '/docs/vue',
    active: route.path.startsWith('/docs/vue')
  }, {
    label: 'Nuxt',
    icon: 'i-simple-icons-nuxt',
    to: '/docs/nuxt',
    active: route.path.startsWith('/docs/nuxt')
  }, {
    label: 'Java',
    icon: 'i-ri-java-line',
    to: '/docs/java',
    active: route.path.startsWith('/docs/java')
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
