<script setup lang="ts">
interface CoverLine {
  title: string
  path: string
  section?: string
}

defineProps<{ lines: CoverLine[] }>()

const appConfig = useAppConfig()
const now = useNow({ scheduler: cb => useIntervalFn(cb, 3_600_000) })
const issue = computed(() => getIssue(now.value, appConfig.site.since))
const season = computed(() => ['冬', '冬', '春', '春', '春', '夏', '夏', '夏', '秋', '秋', '秋', '冬'][now.value.getMonth()])
</script>

<template>
  <section class="relative overflow-hidden border-b border-default">
    <ClientOnly>
      <HomeCoverCanvas class="absolute inset-0 z-0" />
    </ClientOnly>

    <UContainer class="relative pt-10 pb-14 lg:pt-14 lg:pb-20">
      <div class="flex items-center justify-between kicker">
        <ClientOnly>
          <span>{{ issue.label }} · {{ now.getFullYear() }} {{ season }}季刊</span>
          <template #fallback>
            <span>&nbsp;</span>
          </template>
        </ClientOnly>
        <span class="hidden sm:inline">Notes on Code &amp; Craft</span>
      </div>

      <div class="rule-double mt-4" />

      <h1 class="font-display mt-6 font-black leading-[0.9] text-highlighted text-[clamp(4.5rem,17vw,15rem)] tracking-tighter">
        <MotionRevealText text="开发随笔" :stagger="0.08" />
        <Motion
          as="span"
          class="text-primary inline-block"
          :initial="{ scale: 0 }"
          :animate="{ scale: 1 }"
          :transition="{ type: 'spring', bounce: 0.6, delay: 0.5 }"
        >
          .
        </Motion>
      </h1>

      <div class="mt-10 grid gap-10 lg:grid-cols-12">
        <MotionReveal :delay="0.5" class="lg:col-span-5">
          <p class="font-display text-2xl/snug italic sm:text-3xl/snug text-toned text-pretty">
            从代码片段到架构思考，这里是我在成为更优秀全栈工程师路上的所有笔记。
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <UButton to="/docs" size="lg" trailing-icon="i-lucide-arrow-right">
              开始阅读
            </UButton>
            <UButton to="/bookmarks" size="lg" color="neutral" variant="outline">
              书签与工具
            </UButton>
          </div>
        </MotionReveal>

        <MotionReveal :delay="0.7" class="lg:col-span-6 lg:col-start-7">
          <p class="kicker mb-3">
            本期要目 / In This Issue
          </p>
          <ol class="border-t border-inverted">
            <li v-for="(line, index) in lines" :key="line.path" class="border-b border-default">
              <NuxtLink :to="line.path" class="group flex items-baseline gap-4 py-3">
                <span class="font-mono text-xs text-primary w-6">{{ String(index + 1).padStart(2, '0') }}</span>
                <span class="flex-1 font-medium text-highlighted group-hover:translate-x-1 transition-transform duration-300">
                  {{ line.title }}
                </span>
                <span class="kicker hidden sm:inline">{{ line.section }}</span>
              </NuxtLink>
            </li>
          </ol>
        </MotionReveal>
      </div>
    </UContainer>
  </section>
</template>
