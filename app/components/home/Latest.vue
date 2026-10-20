<script setup lang="ts">
interface Note {
  path: string
  stem: string
  title: string
  description?: string
  date?: string
  section?: string
}

const props = defineProps<{ notes: Note[] }>()

const lead = computed(() => props.notes[0])
const rest = computed(() => props.notes.slice(1))

const transitionName = (stem: string) => `title-${stem.replaceAll('/', '-').replaceAll('.', '-')}`
</script>

<template>
  <section class="py-20">
    <UContainer>
      <div class="flex items-end justify-between gap-6">
        <h2 class="font-display text-4xl sm:text-5xl font-black text-highlighted">
          <MotionRevealText text="最近更新" in-view />
        </h2>
        <NuxtLink to="/docs" class="link-wipe kicker hover:text-highlighted">
          全部笔记 →
        </NuxtLink>
      </div>
      <div class="rule mt-4" />

      <div class="grid lg:grid-cols-12 gap-x-10">
        <MotionReveal v-if="lead" class="lg:col-span-7 py-10 lg:border-e border-default lg:pe-10">
          <NuxtLink :to="lead.path" class="group block">
            <p class="kicker text-primary">
              {{ lead.section }} · {{ formatShortDate(lead.date) }}
            </p>
            <h3
              class="font-display mt-4 text-4xl sm:text-6xl font-black leading-[1.02] text-highlighted text-balance"
              :style="{ viewTransitionName: transitionName(lead.stem) }"
            >
              <span class="link-wipe">{{ lead.title }}</span>
            </h3>
            <p class="mt-6 text-lg/relaxed text-toned text-pretty">
              {{ lead.description }}
            </p>
            <span class="mt-8 inline-flex items-center gap-2 text-sm font-medium text-highlighted">
              阅读全文
              <UIcon name="i-lucide-arrow-up-right" class="size-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </span>
          </NuxtLink>
        </MotionReveal>

        <ol class="lg:col-span-5 divide-y divide-default">
          <MotionReveal
            v-for="(note, index) in rest"
            :key="note.path"
            as="li"
            :delay="index * 0.06"
          >
            <NuxtLink :to="note.path" class="group grid grid-cols-[2.5rem_1fr] gap-x-4 py-6">
              <span class="font-display text-3xl font-black text-dimmed group-hover:text-primary transition-colors">
                {{ String(index + 2).padStart(2, '0') }}
              </span>
              <span>
                <span class="kicker">{{ note.section }} · {{ formatShortDate(note.date) }}</span>
                <span
                  class="mt-1 block font-display text-xl font-semibold text-highlighted"
                  :style="{ viewTransitionName: transitionName(note.stem) }"
                >
                  <span class="link-wipe">{{ note.title }}</span>
                </span>
                <span class="mt-1 block text-sm text-muted line-clamp-2">{{ note.description }}</span>
              </span>
            </NuxtLink>
          </MotionReveal>
        </ol>
      </div>
    </UContainer>
  </section>
</template>
