<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  colorMode?: string
  title?: string
  description?: string
  theme?: string
  siteLogo?: string
  siteName?: string
}

const props = withDefaults(defineProps<Props>(), {
  colorMode: 'light',
  title: 'title',
  description: 'description',
  theme: '#6366f1',
})

const siteConfig = useSiteConfig()
const siteName = computed(() => {
  return props.siteName || siteConfig.name
})
const siteLogo = computed(() => {
  return props.siteLogo || siteConfig.logo
})

const title = computed(() => (props.title || '').slice(0, 60))
const description = computed(() => (props.description || '').slice(0, 200))
</script>

<template>
  <div class="w-full h-full flex flex-row justify-center items-center p-16 bg-[#9ca3af0d]">
    <svg
      class="absolute top-0 left-0 h-[380px] pointer-events-none"
      viewBox="0 0 1200 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="gradientBackground"
          x1="0"
          y1="0"
          x2="0"
          y2="380"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" :stop-color="theme" stop-opacity="0.1" />
          <stop offset="100%" :stop-color="theme" stop-opacity="0" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#gradientBackground)" />
    </svg>

    <div class="w-[600]">
      <div class="flex flex-col w-full max-w-[90%]">
        <h1
          class="m-0 font-bold mb-[30px] text-[75px] leading-none"
          style="display: block; text-overflow: ellipsis;"
          :style="{ lineClamp: description ? 2 : 3 }"
        >
          {{ title }}
        </h1>
        <p
          v-if="description"
          class="text-[28px] leading-12"
          :class="[
            colorMode === 'light' ? ['text-gray-700'] : ['text-gray-300'],
          ]"
          style="display: block; line-clamp: 3; text-overflow: ellipsis;"
        >
          {{ description }}
        </p>
      </div>
      <div class="flex flex-row gap-4 items-center mt-10">
        <img v-if="siteLogo" :src="siteLogo" height="48" class="rounded-full object-cover shrink-0">
        <p v-if="siteName" style="font-size: 25px;" class="font-bold">
          {{ siteName }}
        </p>
      </div>
    </div>
    <img
      width="400"
      alt="Illustration"
      class="rounded-lg shadow-2xl ring mx-auto"
      :style="{
        '--tw-ring-color': '#e7e3e4',
      }"
      src="/i-llustration.png"
    >
  </div>
</template>
