<script setup lang="ts">
const { data } = await useAsyncData('friends', () => queryCollection('friends').first())

useSeoMeta({ title: '友链', description: '朋友们的站点。' })
</script>

<template>
  <UContainer class="py-12 lg:py-16">
    <PageMasthead kicker="Friends / 友链" title="友链" description="互相关注的朋友与常读的博客。欢迎在留言板交换友链。" />

    <ul class="grid gap-px border border-default bg-(--ui-border) sm:grid-cols-2 lg:grid-cols-3">
      <MotionReveal
        v-for="(friend, index) in data?.items"
        :key="friend.url"
        as="li"
        :delay="index * 0.05"
        class="bg-default"
      >
        <a :href="friend.url" target="_blank" rel="noopener" class="group flex h-full items-center gap-4 p-6 transition-colors hover:bg-elevated">
          <UAvatar :src="friend.avatar" :alt="friend.name" size="xl" class="grayscale transition group-hover:grayscale-0" />
          <span class="min-w-0">
            <span class="block font-display text-xl font-bold text-highlighted">{{ friend.name }}</span>
            <span class="block text-sm text-muted line-clamp-2">{{ friend.description }}</span>
          </span>
        </a>
      </MotionReveal>
    </ul>
  </UContainer>
</template>
