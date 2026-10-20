<script setup lang="ts">
const { data: page } = await useAsyncData('now', () => queryCollection('now').first())

if (!page.value) {
  throw createError({ status: 404, statusText: '页面不存在', fatal: true })
}

useSeoMeta({ title: 'Now', description: page.value.description })
</script>

<template>
  <UContainer v-if="page" class="py-12 lg:py-16">
    <PageMasthead kicker="Now / 此刻" title="现在" :description="`更新于 ${formatShortDate(page.date)}`" />

    <div class="grid lg:grid-cols-12 gap-10 border-t border-highlighted pt-10">
      <aside class="lg:col-span-3 kicker leading-loose">
        <p>A /now page</p>
        <p>灵感来自 Derek Sivers</p>
      </aside>
      <MotionReveal class="lg:col-span-7">
        <ContentRenderer :value="page" class="prose-editorial" />
      </MotionReveal>
    </div>
  </UContainer>
</template>
