<script setup lang="ts">
const props = defineProps<{
  url: string
  title: string
  icon?: string
}>()

const failed = ref(false)
const src = computed(() => faviconUrl(props.url))
</script>

<template>
  <span class="inline-flex size-8 shrink-0 items-center justify-center rounded-sm bg-elevated overflow-hidden">
    <UIcon v-if="icon" :name="icon" class="size-4.5 text-highlighted" />
    <span v-else-if="failed" class="font-display text-sm font-bold text-primary">{{ title.slice(0, 1) }}</span>
    <img
      v-else
      :src="src"
      alt=""
      width="18"
      height="18"
      loading="lazy"
      decoding="async"
      referrerpolicy="no-referrer"
      class="size-4.5"
      @error="failed = true"
    >
  </span>
</template>
