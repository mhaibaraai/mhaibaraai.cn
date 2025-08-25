<script lang="ts" setup>
import type { ContentNavigationItem, LandingCollectionItem } from '@nuxt/content'
import type { PageFeatureProps } from '@nuxt/ui'

defineProps<{
  page: LandingCollectionItem
}>()

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
const features = computed(() => navigation?.value?.map(item => ({
  title: item.title,
  description: item.description,
  icon: item.icon,
} as PageFeatureProps)))
</script>

<template>
  <UPageSection
    :ui="{
      description: 'text-right',
      features: 'xl:grid-cols-3 lg:gap-10',
    }"
  >
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
          delay: 0.5,
        }"
      >
        {{ page.section.description }}
      </Motion>
    </template>
    <template #features>
      <Motion
        v-for="(feature, index) in features"
        :key="feature.title"
        as="li"
        :initial="{ opacity: 0, transform: 'translateY(10px)' }"
        :while-in-view="{ opacity: 1, transform: 'translateY(0)' }"
        :transition="{ delay: 0.1 * index }"
        :in-view-options="{ once: true }"
      >
        <UPageFeature v-bind="feature" orientation="vertical" />
      </Motion>
    </template>
  </UPageSection>
</template>
