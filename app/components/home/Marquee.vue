<script setup lang="ts">
const props = defineProps<{ items: string[] }>()

const doubled = computed(() => [...props.items, ...props.items])
</script>

<template>
  <div class="group overflow-hidden border-b border-default bg-inverted text-inverted py-3" aria-hidden="true">
    <div class="flex w-max animate-[marquee_40s_linear_infinite] group-hover:[animation-play-state:paused]">
      <span
        v-for="(item, index) in doubled"
        :key="index"
        class="font-display text-xl italic px-6 whitespace-nowrap flex items-center gap-6"
      >
        {{ item }}
        <UIcon name="i-lucide-asterisk" class="size-4 text-primary" />
      </span>
    </div>
  </div>
</template>
