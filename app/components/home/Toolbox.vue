<script setup lang="ts">
defineProps<{
  now?: { description?: string, date: string, path: string }
}>()

const cards = [
  { title: '书签', description: '娱乐、学习、工具……按分类整理的常用站点，也是我的浏览器起始页。', to: '/bookmarks', icon: 'i-lucide-bookmark', kicker: 'Bookmarks' },
  { title: '配置中心', description: 'Surge、Quantumult X 脱敏模板与规则集，以及 zsh、Git、编辑器等 dotfiles。', to: '/config', icon: 'i-lucide-sliders-horizontal', kicker: 'Config' },
  { title: 'Uses', description: '日常在用的硬件、软件与浏览器扩展清单。', to: '/uses', icon: 'i-lucide-laptop', kicker: 'Uses' }
]
</script>

<template>
  <section class="py-20 border-t border-default">
    <UContainer class="grid lg:grid-cols-12 gap-10">
      <MotionReveal class="lg:col-span-4">
        <NuxtLink to="/now" class="group block h-full border-s-4 border-primary ps-6">
          <p class="kicker">
            Now / 此刻
          </p>
          <p class="font-display mt-4 text-3xl/snug italic text-highlighted">
            “{{ now?.description ?? '最近在做什么、在想什么。' }}”
          </p>
          <p class="mt-6 kicker">
            <span v-if="now">更新于 {{ formatShortDate(now.date) }} · </span>
            <span class="link-wipe group-hover:text-highlighted">去看看 →</span>
          </p>
        </NuxtLink>
      </MotionReveal>

      <div class="lg:col-span-8 grid sm:grid-cols-3 gap-px bg-(--ui-border) border border-default">
        <MotionReveal v-for="(card, index) in cards" :key="card.to" :delay="index * 0.08" class="bg-default">
          <NuxtLink :to="card.to" class="group flex h-full flex-col p-6 transition-colors duration-300 hover:bg-inverted hover:text-inverted">
            <span class="kicker group-hover:text-inverted/70">{{ card.kicker }}</span>
            <UIcon :name="card.icon" class="mt-6 size-7 text-primary" />
            <span class="font-display mt-4 text-2xl font-bold">{{ card.title }}</span>
            <span class="mt-2 text-sm text-muted group-hover:text-inverted/70 flex-1">{{ card.description }}</span>
            <UIcon name="i-lucide-arrow-right" class="mt-6 size-5 transition-transform duration-300 group-hover:translate-x-2" />
          </NuxtLink>
        </MotionReveal>
      </div>
    </UContainer>
  </section>
</template>
