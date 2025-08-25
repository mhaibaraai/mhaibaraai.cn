<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { Tree } from '@movk/core'
import { findPageBreadcrumb } from '@nuxt/content/utils'
import { mapContentNavigation } from '@nuxt/ui/utils/content'

definePageMeta({
  layout: 'docs',
  heroBackground: 'opacity-30',
})

const route = useRoute()
const { header, toc } = useAppConfig()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { data: page } = await useAsyncData(`docs-${route.path}`, () => queryCollection('docs').path(route.path).first())
const parentPage = computed(() => Tree.find(navigation?.value || [], item => item.path === route.path)?.node || null)

if (!page.value && !parentPage.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: surround } = await useAsyncData(`surround-${route.path}`, () => {
  return queryCollectionItemSurroundings('docs', route.path, {
    fields: ['description'],
  })
})

const title = page.value?.seo?.title || page.value?.title || parentPage.value?.title
const description = page.value?.seo?.description || page.value?.description || parentPage.value?.description
const breadcrumb = computed(() => mapContentNavigation(findPageBreadcrumb(navigation?.value, page.value?.path, { indexAsChild: true })).map(({ icon, ...link }) => link))

const pageLinks = computed(() => {
  const links = []
  if (header?.github) {
    links.push({
      icon: 'i-simple-icons-github',
      label: 'GitHub',
      to: `${header.github}/${page.value?.stem}.${page.value?.extension}`,
      target: '_blank',
    })
  }

  return [...links, ...(page.value?.links || [])].filter(Boolean)
})

const links = computed(() => {
  const links = []
  if (toc?.bottom?.edit) {
    links.push({
      icon: 'i-lucide-file-pen',
      label: 'Edit this page',
      to: `${toc.bottom.edit}/${page.value?.stem}.${page.value?.extension}`,
      target: '_blank',
    })
  }

  return [...links, ...(toc?.bottom?.links || [])].filter(Boolean)
})

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
})

defineOgImageComponent('Docs', {
  title,
  description,
})
</script>

<template>
  <UPage v-if="page">
    <UPageHeader :title="title" :description="description">
      <template #headline>
        <UBreadcrumb :items="breadcrumb" />
      </template>
      <template #links>
        <UButton
          v-for="link in pageLinks"
          :key="link.label"
          color="neutral"
          variant="outline"
          :target="link.to.startsWith('http') ? '_blank' : undefined"
          size="sm"
          v-bind="link"
        />
        <PageHeaderLinks />
      </template>
    </UPageHeader>

    <UPageBody>
      <ContentRenderer v-if="page" :value="page" />

      <USeparator v-if="surround?.filter(Boolean).length" />
      <UContentSurround :surround="surround" />
    </UPageBody>

    <template v-if="page?.body?.toc?.links?.length" #right>
      <UContentToc :title="toc?.title" :links="page.body?.toc?.links" highlight class="z-[2]">
        <template v-if="toc?.bottom" #bottom>
          <USeparator v-if="page.body?.toc?.links?.length" type="dashed" />

          <UPageLinks
            :title="toc.bottom.title"
            :links="links"
            :ui="{
              linkLeadingIcon: 'size-4',
              linkLabelExternalIcon: 'size-2.5',
            }"
          />

          <USeparator type="dashed" />
        </template>
      </UContentToc>
    </template>
  </UPage>
  <UPage v-else-if="parentPage">
    <UPageHeader :title="parentPage.title" :description="parentPage.description" />

    <UPageBody>
      <UPageGrid>
        <Motion
          v-for="(card, index) in parentPage?.children || []"
          :key="card.title"
          :initial="{ opacity: 0, transform: 'translateY(10px)' }"
          :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
          :transition="{ delay: 0.1 * index }"
          :in-view-options="{ once: true }"
        >
          <UPageCard
            :title="card.title"
            :description="card.description"
            :icon="card.icon"
            :to="card.children?.[0]?.path || card.path"
          />
        </Motion>
      </UPageGrid>
    </UPageBody>
  </UPage>
</template>
