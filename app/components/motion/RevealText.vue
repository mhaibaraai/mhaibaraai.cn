<script setup lang="ts">
interface Props {
  text: string
  /**
   * 渲染的标签
   * @defaultValue 'span'
   */
  as?: string
  /**
   * 首字延迟（秒）
   * @defaultValue 0
   */
  delay?: number
  /**
   * 逐字间隔（秒）
   * @defaultValue 0.035
   */
  stagger?: number
  /**
   * 进入视口时才播放；关闭则挂载即播放
   * @defaultValue false
   */
  inView?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  as: 'span',
  delay: 0,
  stagger: 0.035,
  inView: false
})

const segmenter = new Intl.Segmenter('zh', { granularity: 'grapheme' })
const NBSP = String.fromCharCode(160)
const chars = computed(() => Array.from(segmenter.segment(props.text), s => s.segment === ' ' ? NBSP : s.segment))

const hidden = { y: '110%', rotate: 4 }
const shown = { y: '0%', rotate: 0 }
</script>

<template>
  <component :is="as" :aria-label="text">
    <span
      v-for="(char, index) in chars"
      :key="index"
      class="inline-block overflow-hidden align-bottom pb-[0.08em] mb-[-0.08em]"
      aria-hidden="true"
    >
      <Motion
        as="span"
        class="inline-block will-change-transform"
        :initial="hidden"
        :animate="inView ? undefined : shown"
        :while-in-view="inView ? shown : undefined"
        :in-view-options="{ once: true }"
        :transition="{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: delay + index * stagger }"
      >{{ char }}</Motion>
    </span>
  </component>
</template>
