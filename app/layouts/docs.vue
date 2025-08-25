<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageChildren } from '@nuxt/content/utils'

const route = useRoute()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const childrenNavigation = computed(() => {
  const slug = route.params.slug?.[0] as string
  const children = findPageChildren(navigation?.value, `/${slug}`, { indexAsChild: true })
  return children
})
</script>

<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <UContentSearchButton :collapsed="false" class="mb-8 w-full" size="sm" />

          <UContentNavigation
            :key="route.path"
            highlight
            :navigation="childrenNavigation"
            :ui="{
              linkTrailingBadge: 'font-semibold uppercase',
              linkLeadingIcon: 'size-4 mr-1',
              linkTrailing: 'hidden',
            }"
          />
        </UPageAside>
      </template>

      <slot />
    </UPage>
  </UContainer>
</template>
