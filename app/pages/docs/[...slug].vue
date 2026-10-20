<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageBreadcrumb } from '@nuxt/content/utils'

definePageMeta({ layout: 'docs' })

const route = useRoute()
const appConfig = useAppConfig()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { data: page } = await useAsyncData(`docs-${route.path}`, () => queryCollection('docs').path(route.path).first())

if (!page.value) {
  throw createError({ status: 404, statusText: '页面不存在', fatal: true })
}

const { data: surround } = await useAsyncData(`docs-surround-${route.path}`, () =>
  queryCollectionItemSurroundings('docs', route.path, { fields: ['description'] })
)

const breadcrumb = computed(() => {
  const trail = findPageBreadcrumb(navigation?.value, page.value?.path, { indexAsChild: true })
  return trail.map(item => item.title)
})

const minutes = computed(() => readingMinutes(page.value?.rawbody ?? ''))

const sourceUrl = computed(() => {
  const { owner, repo, branch } = appConfig.site.github
  return `https://github.com/${owner}/${repo}/edit/${branch}/content/${page.value?.stem}.${page.value?.extension}`
})

useSeoMeta({
  title: page.value.title,
  description: page.value.description,
  ogTitle: page.value.title,
  ogDescription: page.value.description,
  ogType: 'article',
  articleModifiedTime: page.value.date
})
</script>

<template>
  <UPage v-if="page">
    <article>
      <header class="pt-10 pb-8 border-b border-default">
        <p class="kicker flex flex-wrap gap-x-2">
          <span v-for="(crumb, index) in breadcrumb" :key="crumb">
            {{ crumb }}<span v-if="index < breadcrumb.length - 1" class="ms-2 text-primary">/</span>
          </span>
        </p>

        <h1
          class="font-display mt-4 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] text-highlighted text-balance"
          :style="{ viewTransitionName: `title-${page.stem.replaceAll('/', '-').replaceAll('.', '-')}` }"
        >
          {{ page.title }}
        </h1>

        <p v-if="page.description" class="mt-6 text-lg sm:text-xl text-toned leading-relaxed text-pretty max-w-3xl">
          {{ page.description }}
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 kicker">
          <span v-if="page.date">更新于 {{ formatShortDate(page.date) }}</span>
          <span>约 {{ minutes }} 分钟</span>
          <ULink :to="sourceUrl" target="_blank" class="link-wipe hover:text-highlighted">
            在 GitHub 上编辑
          </ULink>
          <ULink
            v-for="link in page.links"
            :key="link.to"
            :to="link.to"
            :target="link.target"
            class="link-wipe hover:text-highlighted"
          >
            {{ link.label }}
          </ULink>
        </div>
      </header>

      <UPageBody>
        <ContentRenderer :value="page" class="prose-editorial" />

        <USeparator v-if="surround?.filter(Boolean).length" class="mt-16" />

        <UContentSurround :surround="surround" />
      </UPageBody>
    </article>

    <template v-if="page.body?.toc?.links?.length" #right>
      <UContentToc
        title="本文目录"
        :links="page.body.toc.links"
        highlight
      />
    </template>
  </UPage>
</template>
