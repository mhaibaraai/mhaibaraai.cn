<script setup lang="ts">
const { data: page } = await useAsyncData('landing', () => queryCollection('landing').path('/').first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const title = page.value.seo?.title || page.value.title
const description = page.value.seo?.description || page.value.description

useSeoMeta({
  titleTemplate: '',
  title,
  description,
  ogTitle: title,
  ogDescription: description,
})

defineOgImageComponent('Docs', {
  title: page.value.title,
  description: page.value.description,
})
</script>

<template>
  <UPage v-if="page" class="relative">
    <Motion
      class="hidden lg:block absolute pb-10 left-0 top-0"
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
      <LandingLine />
    </Motion>

    <LandingPageHero :page="page" />
    <LandingPageSection :page="page" />
  </UPage>
</template>
