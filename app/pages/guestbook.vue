<script setup lang="ts">
import Giscus from '@giscus/vue'

const { giscus } = useAppConfig()
const colorMode = useColorMode()
const ready = computed(() => Boolean(giscus.categoryId))

useSeoMeta({ title: '留言板', description: '留下一句话、一个问题，或交换友链。' })
</script>

<template>
  <UContainer class="py-12 lg:py-16">
    <PageMasthead kicker="Guestbook / 留言板" title="留言板" description="留下一句话、一个问题，或交换友链。评论基于 GitHub Discussions。" />

    <div class="border-t border-highlighted pt-10 max-w-3xl">
      <ClientOnly v-if="ready">
        <Giscus
          :repo="giscus.repo as `${string}/${string}`"
          :repo-id="giscus.repoId"
          :category="giscus.category"
          :category-id="giscus.categoryId"
          mapping="pathname"
          reactions-enabled="1"
          emit-metadata="0"
          input-position="top"
          lang="zh-CN"
          loading="lazy"
          :theme="colorMode.value === 'dark' ? 'dark' : 'light'"
        />
      </ClientOnly>
      <UAlert
        v-else
        icon="i-lucide-construction"
        color="neutral"
        variant="outline"
        title="留言板即将开放"
        description="评论功能基于 GitHub Discussions，正在准备中。现在可以通过邮件联系我。"
        :actions="[{ label: '发送邮件', to: 'mailto:mhaibaraai@gmail.com', icon: 'i-lucide-mail' }]"
      />
    </div>
  </UContainer>
</template>
