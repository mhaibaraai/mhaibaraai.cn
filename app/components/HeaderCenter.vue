<script setup lang="ts">
const appConfig = useAppConfig()
const { desktopLinks } = useHeader()
</script>

<template>
  <nav class="flex items-center gap-7" aria-label="主导航">
    <ULink
      v-for="link in desktopLinks"
      :key="link.to"
      :to="link.to"
      :active="link.active"
      :aria-current="link.active ? 'page' : undefined"
      raw
      class="link-wipe py-1 text-sm transition-colors"
      active-class="text-highlighted font-medium bg-size-[100%_1px]!"
      inactive-class="text-muted hover:text-highlighted"
    >
      {{ link.label }}
    </ULink>

    <UPopover mode="hover" :content="{ align: 'start', sideOffset: 12 }">
      <button type="button" class="link-wipe inline-flex items-center gap-1 py-1 text-sm text-muted hover:text-highlighted">
        更多
        <UIcon name="i-lucide-chevron-down" class="size-3.5" />
      </button>

      <template #content>
        <ul class="w-64 p-2">
          <li v-for="item in appConfig.navMore" :key="item.to">
            <NuxtLink :to="item.to" class="flex items-start gap-3 rounded-sm p-2 hover:bg-elevated">
              <UIcon :name="item.icon" class="mt-0.5 size-4 text-primary" />
              <span>
                <span class="block text-sm font-medium text-highlighted">{{ item.label }}</span>
                <span class="block text-xs text-muted">{{ item.description }}</span>
              </span>
            </NuxtLink>
          </li>
        </ul>
      </template>
    </UPopover>
  </nav>
</template>
