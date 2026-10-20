<script setup lang="ts">
import type { RepoStats } from '~~/server/api/github/repos.get'

interface Project {
  name: string
  repo: string
  description: string
  url?: string
  icon?: string
  tags?: string[]
}

defineProps<{ projects: Project[] }>()

const linkOf = (project: Project) => project.url ?? `https://github.com/${project.repo}`

const { data: stats } = useFetch('/api/github/repos', { key: 'github-repos', default: (): Record<string, RepoStats> => ({}) })
</script>

<template>
  <section class="py-20 border-t border-default bg-muted">
    <UContainer>
      <div class="flex items-end justify-between gap-6">
        <h2 class="font-display text-4xl sm:text-5xl font-black text-highlighted">
          <MotionRevealText text="手作项目" in-view />
        </h2>
        <NuxtLink to="/projects" class="link-wipe kicker hover:text-highlighted">
          全部项目 →
        </NuxtLink>
      </div>
      <div class="rule mt-4" />

      <div class="grid md:grid-cols-3 md:divide-x divide-default">
        <MotionReveal
          v-for="(item, index) in projects"
          :key="item.repo"
          :delay="index * 0.1"
          class="py-10 md:px-8 first:md:ps-0 last:md:pe-0 border-b md:border-b-0 border-default"
        >
          <NuxtLink :to="linkOf(item)" target="_blank" class="group block">
            <div class="flex items-center justify-between">
              <UIcon :name="item.icon ?? 'i-lucide-box'" class="size-8 text-primary transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
              <span v-if="stats[item.repo]" class="kicker inline-flex items-center gap-1">
                <UIcon name="i-lucide-star" class="size-3" />
                {{ stats[item.repo]?.stars }}
              </span>
            </div>
            <h3 class="font-display mt-6 text-2xl font-bold text-highlighted">
              <span class="link-wipe">{{ item.name }}</span>
            </h3>
            <p class="mt-3 text-sm text-muted leading-relaxed">
              {{ item.description }}
            </p>
            <p class="mt-4 kicker">
              {{ item.tags?.join(' · ') }}
            </p>
          </NuxtLink>
        </MotionReveal>
      </div>
    </UContainer>
  </section>
</template>
