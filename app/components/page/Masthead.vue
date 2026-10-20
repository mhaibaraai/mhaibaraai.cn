<script setup lang="ts">
defineProps<{
  kicker: string
  title: string
  description?: string
}>()
</script>

<template>
  <header class="pb-10">
    <p class="kicker">
      {{ kicker }}
    </p>
    <div class="rule-double mt-3" />
    <div class="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="font-display text-6xl sm:text-8xl font-black leading-none text-highlighted">
          <MotionRevealText :text="title" :stagger="0.06" /><span class="text-primary">.</span>
        </h1>
        <MotionReveal v-if="description" :delay="0.3">
          <p class="mt-6 max-w-2xl text-lg text-toned text-pretty">
            {{ description }}
          </p>
        </MotionReveal>
      </div>
      <div v-if="$slots.default" class="flex gap-3 shrink-0">
        <slot />
      </div>
    </div>
  </header>
</template>
