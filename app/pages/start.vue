<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const appConfig = useAppConfig()
const { data: categories } = await useBookmarks()
const visible = computed(() => filterBookmarks(categories.value, { includeUnlisted: true }))

const now = useNow({ scheduler: cb => useIntervalFn(cb, 1000) })
const time = computed(() => now.value.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }))
const greeting = computed(() => {
  const hour = now.value.getHours()
  if (hour < 6) return '夜深了'
  if (hour < 11) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})
const issue = computed(() => getIssue(now.value, appConfig.site.since))

useSeoMeta({ title: '起始页', robots: 'noindex, nofollow' })
</script>

<template>
  <div class="relative min-h-dvh overflow-hidden">
    <ClientOnly>
      <HomeCoverCanvas class="absolute inset-x-0 top-0 h-[60vh] opacity-60" />
    </ClientOnly>

    <UContainer class="relative flex min-h-dvh flex-col py-8">
      <header class="flex items-center justify-between kicker">
        <NuxtLink to="/" target="_top" class="font-display text-lg normal-case tracking-normal italic font-black text-highlighted">
          YiXuan<span class="text-primary">.</span>
        </NuxtLink>
        <div class="flex items-center gap-2">
          <ClientOnly>
            <span>{{ issue.label }}</span>
          </ClientOnly>
          <UColorModeButton size="sm" />
        </div>
      </header>

      <section class="mt-[12vh] grid gap-10 lg:grid-cols-12 lg:items-end">
        <div class="lg:col-span-5">
          <ClientOnly>
            <p class="font-display font-black leading-none text-highlighted text-[clamp(5rem,14vw,10rem)] tabular-nums tracking-tighter">
              {{ time }}
            </p>
            <p class="mt-3 text-lg text-toned">
              {{ greeting }}，{{ formatLongDate(now) }}
            </p>
            <template #fallback>
              <p class="text-[clamp(5rem,14vw,10rem)] leading-none">
                &nbsp;
              </p>
            </template>
          </ClientOnly>
        </div>

        <div class="lg:col-span-7">
          <StartSearchBox />
        </div>
      </section>

      <section class="mt-16 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-6 border-t border-highlighted pt-8">
        <MotionReveal
          v-for="(category, index) in visible"
          :key="category.title"
          :delay="index * 0.05"
          :y="12"
        >
          <h2 class="flex items-center gap-2 kicker text-highlighted">
            <UIcon :name="category.icon" class="size-3.5 text-primary" />
            {{ category.title }}
          </h2>
          <ul class="mt-4 space-y-1">
            <li v-for="item in category.items" :key="item.url">
              <a
                :href="item.url"
                target="_top"
                class="group -mx-2 flex items-center gap-2.5 rounded-sm px-2 py-1.5 hover:bg-elevated"
              >
                <BookmarksFavicon :url="item.url" :title="item.title" :icon="item.icon" class="size-6!" />
                <span class="truncate text-sm text-toned group-hover:text-highlighted">{{ item.title }}</span>
              </a>
            </li>
          </ul>
        </MotionReveal>
      </section>

      <footer class="mt-auto pt-12 flex justify-between kicker">
        <NuxtLink to="/bookmarks" target="_top" class="link-wipe">管理书签</NuxtLink>
        <span>mhaibaraai.cn/start</span>
      </footer>
    </UContainer>
  </div>
</template>
