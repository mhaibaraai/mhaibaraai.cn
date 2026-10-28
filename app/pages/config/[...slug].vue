<script setup lang="ts">
const route = useRoute()

const { data: pages } = await useAsyncData('config-pages', () =>
  queryCollection('config').select('path', 'title', 'icon', 'stem').order('stem', 'ASC').all()
)

const { data: page } = await useAsyncData(`config-${route.path}`, () => queryCollection('config').path(route.path).first())

if (!page.value) {
  throw createError({ status: 404, statusText: '页面不存在', fatal: true })
}

useSeoMeta({
  title: page.value.title,
  description: page.value.description
})
</script>

<template>
  <UContainer v-if="page" class="py-12 lg:py-16">
    <PageMasthead kicker="Config / 配置中心" :title="page.title" :description="page.description" />

    <nav class="flex gap-6 border-b border-default overflow-x-auto" aria-label="配置分类">
      <NuxtLink
        v-for="item in pages"
        :key="item.path"
        :to="item.path"
        class="relative flex items-center gap-2 py-3 text-sm whitespace-nowrap transition-colors"
        :class="item.path === page.path ? 'text-highlighted font-medium' : 'text-muted hover:text-highlighted'"
      >
        <UIcon v-if="item.icon" :name="item.icon" class="size-4" />
        {{ item.title }}
        <span v-if="item.path === page.path" class="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
      </NuxtLink>
    </nav>

    <UPage>
      <UPageBody>
        <ContentRenderer :value="page" />
      </UPageBody>

      <template v-if="page.body?.toc?.links?.length" #right>
        <UContentToc title="本页目录" :links="page.body.toc.links" highlight />
      </template>
    </UPage>
  </UContainer>
</template>
