<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
</script>

<template>
  <div class="min-h-dvh flex flex-col">
    <SiteHeader />

    <main class="flex-1">
      <UContainer>
        <UPage>
          <template #left>
            <UPageAside :ui="{ root: 'lg:border-e lg:border-default' }">
              <p class="kicker mb-4">
                Index / 目录
              </p>
              <UContentNavigation
                :navigation="navigation"
                highlight
                :ui="{ linkTrailingBadge: 'font-mono' }"
              />
            </UPageAside>
          </template>

          <slot />
        </UPage>
      </UContainer>
    </main>

    <SiteFooter />
  </div>
</template>
