<script setup lang="ts">
const appConfig = useAppConfig()
const route = useRoute()
const { open: searchOpen } = useContentSearch()

const menuOpen = ref(false)
const now = useNow({ scheduler: cb => useIntervalFn(cb, 60_000) })
const issue = computed(() => getIssue(now.value, appConfig.site.since))
const today = computed(() => formatLongDate(now.value))

const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)

const moreItems = computed(() => appConfig.navMore.map(item => ({
  label: item.label,
  description: item.description,
  icon: item.icon,
  to: item.to
})))

watch(() => route.path, () => {
  menuOpen.value = false
})
</script>

<template>
  <header class="sticky top-0 z-50 bg-default/85 backdrop-blur-md">
    <div class="hidden md:block border-b border-default">
      <UContainer class="flex h-8 items-center justify-between kicker">
        <ClientOnly>
          <span>{{ today }}</span>
          <span>{{ issue.label }}</span>
        </ClientOnly>
      </UContainer>
    </div>

    <UContainer class="flex h-(--ui-header-height) items-center gap-6 border-b border-default">
      <NuxtLink to="/" class="font-display text-2xl font-black italic text-highlighted" aria-label="返回首页">
        YiXuan<span class="text-primary">.</span>
      </NuxtLink>

      <nav class="hidden lg:flex items-center gap-7 ms-6" aria-label="主导航">
        <NuxtLink
          v-for="link in appConfig.nav"
          :key="link.to"
          :to="link.to"
          class="link-wipe text-sm py-1 transition-colors"
          :class="isActive(link.to) ? 'text-highlighted font-medium' : 'text-muted hover:text-highlighted'"
        >
          {{ link.label }}
        </NuxtLink>

        <UPopover mode="hover" :content="{ align: 'start', sideOffset: 12 }">
          <button type="button" class="link-wipe text-sm py-1 text-muted hover:text-highlighted inline-flex items-center gap-1">
            更多
            <UIcon name="i-lucide-chevron-down" class="size-3.5" />
          </button>

          <template #content>
            <ul class="w-64 p-2">
              <li v-for="item in moreItems" :key="item.to">
                <NuxtLink :to="item.to" class="flex items-start gap-3 rounded-sm p-2 hover:bg-elevated">
                  <UIcon :name="item.icon" class="size-4 mt-0.5 text-primary" />
                  <span>
                    <span class="block text-sm font-medium text-highlighted">{{ item.label }}</span>
                    <span class="block text-xs text-muted">{{ item.description }}</span>
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </template>
        </UPopover>
      </nav>

      <div class="ms-auto flex items-center gap-1">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-search"
          aria-label="搜索"
          class="hidden sm:inline-flex"
          @click="searchOpen = true"
        >
          <span class="text-muted text-xs font-mono">⌘K</span>
        </UButton>
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-search"
          aria-label="搜索"
          class="sm:hidden"
          @click="searchOpen = true"
        />
        <UColorModeButton />
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-simple-icons-github"
          :to="`https://github.com/${appConfig.site.github.owner}`"
          target="_blank"
          aria-label="GitHub"
          class="hidden sm:inline-flex"
        />
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-menu"
          aria-label="打开菜单"
          class="lg:hidden"
          @click="menuOpen = true"
        />
      </div>
    </UContainer>

    <div class="reading-progress h-0.5 bg-primary" aria-hidden="true" />

    <USlideover v-model:open="menuOpen" title="目录" side="right">
      <template #body>
        <nav class="flex flex-col" aria-label="移动端导航">
          <NuxtLink
            v-for="(link, index) in [...appConfig.nav, ...appConfig.navMore]"
            :key="link.to"
            :to="link.to"
            class="flex items-baseline gap-4 border-b border-default py-4"
          >
            <span class="kicker w-6">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="font-display text-2xl font-semibold text-highlighted">{{ link.label }}</span>
          </NuxtLink>
        </nav>
      </template>
    </USlideover>
  </header>
</template>
