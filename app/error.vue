<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { nuxtUiLocale, rootNavigation, files } = await useDocsShell()

const is404 = computed(() => props.error.status === 404)

useSeoMeta({ title: is404.value ? '页面不存在' : '出错了' })
</script>

<template>
  <UApp :locale="nuxtUiLocale">
    <Header />

    <UMain as="main">
      <UContainer class="py-32">
        <p class="kicker">
          Erratum · {{ error.status }}
        </p>
        <h1 class="mt-4 font-display text-6xl font-black text-highlighted sm:text-8xl">
          {{ is404 ? '此页已被撕去' : '印刷事故' }}<span class="text-primary">.</span>
        </h1>
        <p class="mt-6 max-w-xl text-lg text-muted">
          {{ is404 ? '你要找的页面不存在，可能已经搬家或从未出版。' : error.message }}
        </p>
        <UButton
          class="mt-10"
          size="lg"
          trailing-icon="i-lucide-arrow-right"
          @click="clearError({ redirect: '/' })"
        >
          回到首页
        </UButton>
      </UContainer>
    </UMain>

    <Footer />

    <ClientOnly>
      <UContentSearch :files="files" :navigation="rootNavigation" />
    </ClientOnly>
  </UApp>
</template>
