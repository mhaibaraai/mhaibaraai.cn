<script setup lang="ts">
const { data } = await useAsyncData('uses', () => queryCollection('uses').first())

useSeoMeta({ title: 'Uses', description: '日常在用的硬件、软件、浏览器与网络工具。' })
</script>

<template>
  <UContainer class="py-12 lg:py-16">
    <PageMasthead kicker="Uses / 装备与软件" title="Uses" description="日常在用的硬件、软件与工具。好用的东西值得被记录。" />

    <section v-for="(group, index) in data?.groups" :key="group.title" class="grid gap-6 border-t border-highlighted py-10 lg:grid-cols-12">
      <MotionReveal class="lg:col-span-3">
        <span class="font-mono text-xs text-primary">{{ String(index + 1).padStart(2, '0') }}</span>
        <h2 class="font-display mt-2 flex items-center gap-3 text-3xl font-black text-highlighted">
          <UIcon :name="group.icon" class="size-6 text-primary" />
          {{ group.title }}
        </h2>
      </MotionReveal>

      <ul class="lg:col-span-9 divide-y divide-default">
        <MotionReveal
          v-for="(item, i) in group.items"
          :key="item.name"
          as="li"
          :delay="i * 0.05"
          :y="12"
        >
          <component
            :is="item.url ? 'a' : 'div'"
            :href="item.url"
            :target="item.url ? '_blank' : undefined"
            :rel="item.url ? 'noopener' : undefined"
            class="group grid grid-cols-[2rem_1fr] gap-x-4 py-4"
          >
            <UIcon :name="item.icon ?? 'i-lucide-dot'" class="size-5 mt-0.5 text-muted group-hover:text-primary transition-colors" />
            <span>
              <span class="font-medium text-highlighted" :class="item.url && 'link-wipe'">{{ item.name }}</span>
              <span class="block text-sm text-muted">{{ item.description }}</span>
            </span>
          </component>
        </MotionReveal>
      </ul>
    </section>
  </UContainer>
</template>
