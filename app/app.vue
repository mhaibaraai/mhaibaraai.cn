<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { zh_cn } from '@nuxt/ui/locale'

const appConfig = useAppConfig()
const site = useSiteConfig()

const { data: navigation } = await useAsyncData('docs-navigation', () => queryCollectionNavigation('docs'), {
  transform: data => data.find(item => item.path === '/docs')?.children ?? []
})

const { data: files } = useLazyAsyncData('docs-search', () => queryCollectionSearchSections('docs'), { server: false })

provide('navigation', navigation as Ref<ContentNavigationItem[]>)

const searchLinks = computed(() => [...appConfig.nav, ...appConfig.navMore].map(link => ({
  label: link.label,
  icon: link.icon,
  to: link.to
})))

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }]
})

useSeoMeta({
  titleTemplate: title => title ? `${title} · ${site.name}` : site.name,
  description: site.description,
  ogSiteName: site.name,
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp :locale="zh_cn">
    <NuxtLoadingIndicator color="var(--ui-primary)" :height="2" />

    <MotionConfig reduced-motion="user">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </MotionConfig>

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        :navigation="navigation"
        :links="searchLinks"
        :fuse="{ resultLimit: 42 }"
        placeholder="搜索笔记、页面…"
      />
    </ClientOnly>
  </UApp>
</template>
