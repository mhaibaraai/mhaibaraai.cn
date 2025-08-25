<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import type { NavigationMenuItem } from '@nuxt/ui'
import { Tree } from '@movk/core'

const route = useRoute()
const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
const { header } = useAppConfig()

const items = computed(() => Tree.transform(navigation?.value || [], (node, depth) => {
  return {
    label: node.title,
    icon: node.icon,
    active: route.path.startsWith(node.path),
    to: (depth === 0 || !node.children) ? node.path : node.children?.[0]?.path,
  } as NavigationMenuItem
}))
</script>

<template>
  <UHeader :ui="{ center: 'flex-1' }">
    <UNavigationMenu
      :items="items"
      variant="link"
      :ui="{
        linkLeadingIcon: 'size-4 shrink-0',
        childLinkIcon: 'size-4 shrink-0',
      }"
    />

    <template #left>
      <NuxtLink to="/">
        <UUser :avatar="{ src: '/avatar.png' }" name="yixuan" />
      </NuxtLink>
    </template>

    <template #right>
      <ThemePicker />

      <UTooltip text="Search" :kbds="['meta', 'K']">
        <UContentSearchButton v-if="header?.search" />
      </UTooltip>

      <UTooltip text="Color Mode">
        <UColorModeButton v-if="header?.colorMode" />
      </UTooltip>

      <template v-if="header?.links">
        <UTooltip
          v-for="link in header.links"
          :key="link['aria-label']"
          :text="link['aria-label']"
          class="hidden lg:flex"
        >
          <UButton v-bind="{ color: 'neutral', variant: 'ghost', ...link }" />
        </UTooltip>
      </template>
    </template>

    <template #body>
      <UContentNavigation highlight :navigation="navigation" />
    </template>
  </UHeader>
</template>
