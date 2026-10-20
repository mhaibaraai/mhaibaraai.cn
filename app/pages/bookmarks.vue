<script setup lang="ts">
const { data: categories } = await useBookmarks()

const query = ref('')
const active = ref<string>()

const visible = computed(() => filterBookmarks(categories.value, { query: query.value, category: active.value }))
const total = computed(() => filterBookmarks(categories.value).reduce((sum, c) => sum + c.items.length, 0))
const tabs = computed(() => filterBookmarks(categories.value).map(c => ({ title: c.title, icon: c.icon })))

useSeoMeta({
  title: '书签',
  description: '按分类整理的常用站点：开发、AI、学习、设计、工具与娱乐。'
})
</script>

<template>
  <UContainer class="py-12 lg:py-16">
    <PageMasthead
      kicker="Bookmarks / 书签"
      title="书签"
      :description="`${total} 个常用站点，按主题归档。这里也是我浏览器的新标签页。`"
    >
      <UButton to="/start" color="neutral" variant="outline" trailing-icon="i-lucide-arrow-up-right">
        打开起始页
      </UButton>
    </PageMasthead>

    <div class="sticky top-(--ui-header-height) md:top-[calc(var(--ui-header-height)+2rem)] z-10 -mx-4 p-4 bg-default/90 backdrop-blur-sm border-b border-default flex flex-col gap-4 md:flex-row md:items-center">
      <UInput
        v-model="query"
        icon="i-lucide-search"
        placeholder="搜索标题、域名或标签…"
        variant="none"
        class="md:w-72 border-b border-inverted"
        aria-label="搜索书签"
      />
      <div class="flex gap-2 overflow-x-auto" role="tablist" aria-label="书签分类">
        <UButton
          :variant="active ? 'ghost' : 'solid'"
          color="neutral"
          size="sm"
          role="tab"
          :aria-selected="!active"
          @click="active = undefined"
        >
          全部
        </UButton>
        <UButton
          v-for="tab in tabs"
          :key="tab.title"
          :icon="tab.icon"
          :variant="active === tab.title ? 'solid' : 'ghost'"
          color="neutral"
          size="sm"
          role="tab"
          :aria-selected="active === tab.title"
          @click="active = active === tab.title ? undefined : tab.title"
        >
          {{ tab.title }}
        </UButton>
      </div>
    </div>

    <TransitionGroup tag="div" name="list" class="mt-4">
      <section v-for="(category, index) in visible" :key="category.title" class="pt-12">
        <header class="flex items-baseline gap-4 border-b border-inverted pb-3">
          <span class="font-mono text-xs text-primary">{{ String(index + 1).padStart(2, '0') }}</span>
          <h2 class="font-display text-3xl font-black text-highlighted">
            {{ category.title }}
          </h2>
          <span class="text-sm text-muted hidden sm:inline">{{ category.description }}</span>
          <span class="ms-auto kicker">{{ category.items.length }}</span>
        </header>

        <ul class="grid sm:grid-cols-2 lg:grid-cols-4 border-s border-default">
          <li v-for="item in category.items" :key="item.url" class="border-e border-b border-default">
            <a
              :href="item.url"
              target="_blank"
              rel="noopener"
              class="group flex h-full gap-3 p-4 transition-colors duration-300 hover:bg-elevated"
            >
              <BookmarksFavicon :url="item.url" :title="item.title" :icon="item.icon" />
              <span class="min-w-0">
                <span class="flex items-center gap-1 font-medium text-highlighted">
                  <span class="truncate">{{ item.title }}</span>
                  <UIcon name="i-lucide-arrow-up-right" class="size-3.5 shrink-0 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                </span>
                <span class="block text-xs text-muted truncate">{{ item.description ?? hostOf(item.url) }}</span>
              </span>
            </a>
          </li>
        </ul>
      </section>
    </TransitionGroup>

    <p v-if="!visible.length" class="py-24 text-center text-muted">
      没有找到与「{{ query }}」相关的书签。
    </p>
  </UContainer>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: opacity 0.35s var(--ease-editorial), transform 0.35s var(--ease-editorial);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.list-leave-active {
  position: absolute;
}
</style>
