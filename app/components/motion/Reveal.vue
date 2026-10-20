<script setup lang="ts">
interface Props {
  /**
   * 渲染的标签
   * @defaultValue 'div'
   */
  as?: 'div' | 'li' | 'section' | 'article'
  /**
   * 延迟（秒）
   * @defaultValue 0
   */
  delay?: number
  /**
   * 起始纵向位移（px）
   * @defaultValue 24
   */
  y?: number
}

const props = withDefaults(defineProps<Props>(), {
  as: 'div',
  delay: 0,
  y: 24
})
</script>

<template>
  <Motion
    :as="as"
    :initial="{ opacity: 0, y: props.y }"
    :while-in-view="{ opacity: 1, y: 0 }"
    :in-view-options="{ once: true, margin: '0px 0px -10% 0px' }"
    :transition="{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }"
  >
    <slot />
  </Motion>
</template>
