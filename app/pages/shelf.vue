<script setup lang="ts">
type ShelfType = 'book' | 'movie' | 'series' | 'music' | 'game'

const { data } = await useAsyncData('shelf', () => queryCollection('shelf').first())

const TYPES: Record<ShelfType, { label: string, icon: string }> = {
  book: { label: '书', icon: 'i-lucide-book' },
  movie: { label: '电影', icon: 'i-lucide-clapperboard' },
  series: { label: '剧集', icon: 'i-lucide-tv' },
  music: { label: '音乐', icon: 'i-lucide-disc-3' },
  game: { label: '游戏', icon: 'i-lucide-gamepad-2' }
}
const STATUS = { done: '已完成', doing: '进行中', todo: '想看' } as const

const active = ref<ShelfType>()
const items = computed(() => [...(data.value?.items ?? [])]
  .filter(item => !active.value || item.type === active.value)
  .sort((a, b) => b.date.localeCompare(a.date))
)

useSeoMeta({ title: '书影音', description: '读过、看过、听过、玩过的作品记录。' })
</script>

<template>
  <UContainer class="py-12 lg:py-16">
    <PageMasthead kicker="Shelf / 书影音" title="书影音" description="读过、看过、听过、玩过的作品，附一句话短评。" />

    <div class="flex gap-2 border-b border-default pb-4 overflow-x-auto">
      <UButton :variant="active ? 'ghost' : 'solid'" color="neutral" size="sm" @click="active = undefined">
        全部
      </UButton>
      <UButton
        v-for="(meta, type) in TYPES"
        :key="type"
        :icon="meta.icon"
        :variant="active === type ? 'solid' : 'ghost'"
        color="neutral"
        size="sm"
        @click="active = active === type ? undefined : type"
      >
        {{ meta.label }}
      </UButton>
    </div>

    <ol class="divide-y divide-default">
      <MotionReveal
        v-for="item in items"
        :key="`${item.type}-${item.title}`"
        as="li"
        :y="12"
        class="grid gap-x-6 gap-y-1 py-6 sm:grid-cols-[6rem_1fr_auto]"
      >
        <span class="kicker">{{ item.date }}</span>
        <span>
          <span class="flex items-center gap-2">
            <UIcon :name="TYPES[item.type].icon" class="size-4 text-primary" />
            <component
              :is="item.url ? 'a' : 'span'"
              :href="item.url"
              target="_blank"
              class="font-display text-xl font-bold text-highlighted"
            >{{ item.title }}</component>
          </span>
          <span v-if="item.creator" class="block text-sm text-muted">{{ item.creator }}</span>
          <span v-if="item.note" class="mt-2 block text-toned italic">“{{ item.note }}”</span>
        </span>
        <span class="flex items-center gap-3 sm:flex-col sm:items-end">
          <UBadge :label="STATUS[item.status]" color="neutral" variant="outline" size="sm" />
          <span v-if="item.rating" class="text-primary text-sm tracking-widest" :aria-label="`${item.rating} 星`">
            {{ '★'.repeat(item.rating) }}<span class="text-dimmed">{{ '★'.repeat(5 - item.rating) }}</span>
          </span>
        </span>
      </MotionReveal>
    </ol>
  </UContainer>
</template>
