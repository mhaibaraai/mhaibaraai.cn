<script lang="ts" setup>
import type { LandingCollectionItem } from '@nuxt/content'

defineProps<{
  page: LandingCollectionItem
}>()
</script>

<template>
  <UPageHero
    v-if="page"
    :ui="{
      container: 'md:pt-18 lg:pt-10',
      title: 'font-semibold sm:text-6xl',
    }"
    orientation="horizontal"
  >
    <Motion
      :initial="{
        scale: 1.1,
        opacity: 0,
        filter: 'blur(20px)',
      }"
      :animate="{
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
      }"
      :transition="{
        duration: 0.6,
        delay: 0.1,
      }"
    >
      <NuxtImg
        src="/i-llustration.png"
        alt="Illustration"
        width="300"
        class="rounded-lg shadow-2xl ring ring-default mx-auto"
      />
    </Motion>

    <template #title>
      <Motion
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)',
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
        }"
        :transition="{
          duration: 0.6,
          delay: 0.1,
        }"
      >
        {{ page.title }}
      </Motion>
    </template>

    <template #description>
      <Motion
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)',
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
        }"
        :transition="{
          duration: 0.6,
          delay: 0.3,
        }"
      >
        {{ page.description }}
      </Motion>
    </template>

    <template #links>
      <Motion
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)',
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
        }"
        :transition="{
          duration: 0.6,
          delay: 0.5,
        }"
      >
        <div v-if="page.hero?.links" class="flex items-center gap-2">
          <UButton v-for="link of page.hero?.links" :key="link.label" v-bind="link" />
        </div>
      </Motion>
    </template>
  </UPageHero>
</template>
