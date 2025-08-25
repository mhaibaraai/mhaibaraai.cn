<script setup lang="ts">
import colors from 'tailwindcss/colors'

const { isLoading } = useLoadingIndicator()
const appear = ref(false)
const appeared = ref(false)
const route = useRoute()
const site = useSiteConfig()
const appConfig = useAppConfig()
const colorMode = useColorMode()

const heroBackgroundClass = computed(() => route.meta?.heroBackground || '')

const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('docs', ['description']))
const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections('docs'), {
  server: false,
})
const color = computed(() => colorMode.value === 'dark' ? (colors as any)[appConfig.ui.colors.neutral][900] : 'white')
const radius = computed(() => `:root { --ui-radius: ${appConfig.theme.radius}rem; }`)
const blackAsPrimary = computed(() => appConfig.theme.blackAsPrimary ? `:root { --ui-primary: black; } .dark { --ui-primary: white; }` : ':root {}')

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color },
  ],
  link: [],
  style: [
    { innerHTML: radius, id: 'nuxt-ui-radius', tagPriority: -2 },
    { innerHTML: blackAsPrimary, id: 'nuxt-ui-black-as-primary', tagPriority: -2 },
  ],
})

useSeoMeta({
  titleTemplate: `%s - ${site.name}`,
  ogSiteName: site.name,
  twitterCard: 'summary_large_image',
})

useFaviconFromTheme()
provide('navigation', navigation)

onMounted(() => {
  setTimeout(() => {
    appear.value = true
    setTimeout(() => {
      appeared.value = true
    }, 1000)
  }, 0)
})
</script>

<template>
  <UApp :toaster="appConfig.toaster">
    <NuxtLoadingIndicator color="var(--ui-primary)" :height="2" />

    <AppHeader />

    <UMain>
      <HeroBackground
        class="absolute w-full -top-px transition-all text-primary shrink-0 -z-10"
        :class="[
          isLoading ? 'animate-pulse' : (appear ? heroBackgroundClass : 'opacity-0'),
          appeared ? 'duration-[400ms]' : 'duration-1000',
        ]"
      />
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch :files="files" :navigation="navigation" />
    </ClientOnly>
  </UApp>
</template>
