<script setup lang="ts">
import type { RepoStats } from '~~/server/api/github/repos.get'

const { data } = await useAsyncData('projects', () => queryCollection('projects').first())
const { data: stats } = await useFetch('/api/github/repos', { key: 'github-repos', default: (): Record<string, RepoStats> => ({}) })
const { data: contributions } = await useFetch('/api/github/contributions', { key: 'github-contributions' })

const linkOf = (item: { url?: string, repo: string }) => item.url ?? `https://github.com/${item.repo}`

useSeoMeta({ title: '项目', description: 'Movk 系列开源项目与日常小工具。' })
</script>

<template>
  <UContainer class="py-12 lg:py-16">
    <PageMasthead kicker="Projects / 项目" title="项目" description="围绕 Nuxt 与 Vue 生态的开源库，以及解决自己问题的小工具。">
      <UButton to="https://github.com/mhaibaraai" target="_blank" color="neutral" variant="outline" icon="i-simple-icons-github">
        GitHub
      </UButton>
    </PageMasthead>

    <MotionReveal v-if="contributions" class="border-t border-inverted py-10">
      <ProjectsHeatmap :data="contributions" />
    </MotionReveal>

    <ol class="border-t border-inverted">
      <MotionReveal
        v-for="(item, index) in data?.items"
        :key="item.repo"
        as="li"
        :y="16"
        class="border-b border-default"
      >
        <a :href="linkOf(item)" target="_blank" rel="noopener" class="group grid gap-x-8 gap-y-3 py-8 lg:grid-cols-12 lg:items-baseline">
          <span class="lg:col-span-1 font-display text-4xl font-black text-dimmed transition-colors group-hover:text-primary">
            {{ String(index + 1).padStart(2, '0') }}
          </span>
          <span class="lg:col-span-4">
            <span class="flex items-center gap-3">
              <UIcon :name="item.icon ?? 'i-lucide-box'" class="size-6 text-primary" />
              <span class="font-display text-2xl sm:text-3xl font-bold text-highlighted link-wipe">{{ item.name }}</span>
            </span>
            <span class="mt-2 block kicker">{{ item.repo }}</span>
          </span>
          <span class="lg:col-span-5 text-toned leading-relaxed">{{ item.description }}</span>
          <span class="lg:col-span-2 flex flex-wrap items-center gap-3 lg:justify-end kicker">
            <span v-if="stats[item.repo]?.language">{{ stats[item.repo]?.language }}</span>
            <span v-if="stats[item.repo]" class="inline-flex items-center gap-1">
              <UIcon name="i-lucide-star" class="size-3" />{{ stats[item.repo]?.stars }}
            </span>
          </span>
        </a>
      </MotionReveal>
    </ol>
  </UContainer>
</template>
