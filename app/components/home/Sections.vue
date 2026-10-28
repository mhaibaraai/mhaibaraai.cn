<script setup lang="ts">
import type { NoteSection } from '~/utils/navigation'

defineProps<{ sections: NoteSection[] }>()

const list = useTemplateRef<HTMLElement>('list')
const { elementX, elementY, isOutside } = useMouseInElement(list)
const hovered = ref<NoteSection>()

const x = useSpring(0, { stiffness: 260, damping: 26 })
const y = useSpring(0, { stiffness: 260, damping: 26 })

watch([elementX, elementY], ([nx, ny]) => {
  x.set(nx)
  y.set(ny)
})
</script>

<template>
  <section class="py-20 border-t border-default">
    <UContainer>
      <div class="grid lg:grid-cols-12 gap-10">
        <div class="lg:col-span-4">
          <p class="kicker">
            Sections / 栏目
          </p>
          <h2 class="font-display mt-3 text-4xl sm:text-5xl font-black text-highlighted">
            <MotionRevealText text="按主题浏览" in-view />
          </h2>
          <p class="mt-4 text-muted max-w-xs">
            笔记按主题分栏归档，每一栏都是一段持续更新的学习记录。
          </p>
        </div>

        <div ref="list" class="relative lg:col-span-8" @mouseleave="hovered = undefined">
          <ul class="border-t border-inverted">
            <li v-for="(section, index) in sections" :key="section.path" class="border-b border-default">
              <NuxtLink
                :to="section.firstPath ?? section.path"
                class="group relative flex items-center gap-6 py-5 overflow-hidden"
                @mouseenter="hovered = section"
              >
                <span class="absolute inset-0 origin-bottom scale-y-0 bg-elevated transition-transform duration-500 ease-editorial group-hover:scale-y-100" />
                <span class="relative font-mono text-xs text-muted w-8 ps-2">{{ String(index + 1).padStart(2, '0') }}</span>
                <span class="relative flex-1">
                  <span class="block font-display text-2xl sm:text-4xl font-semibold text-highlighted transition-transform duration-500 ease-editorial group-hover:translate-x-3">
                    {{ section.title }}
                  </span>
                  <span class="block text-sm text-muted mt-1 max-h-0 opacity-0 overflow-hidden transition-all duration-500 group-hover:max-h-10 group-hover:opacity-100 group-hover:translate-x-3">
                    {{ section.description }}
                  </span>
                </span>
                <span class="relative kicker pe-2">{{ section.count }} 篇</span>
              </NuxtLink>
            </li>
          </ul>

          <Motion
            v-if="hovered?.icon"
            class="pointer-events-none absolute top-0 left-0 hidden lg:flex size-24 items-center justify-center rounded-full bg-primary text-inverted shadow-xl"
            :style="{ x, y, translateX: '-50%', translateY: '-50%' }"
            :initial="{ scale: 0 }"
            :animate="{ scale: isOutside ? 0 : 1 }"
            aria-hidden="true"
          >
            <UIcon :name="hovered.icon" class="size-10" />
          </Motion>
        </div>
      </div>
    </UContainer>
  </section>
</template>
