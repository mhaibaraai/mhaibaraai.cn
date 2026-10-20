<script setup lang="ts">
const engineId = useLocalStorage('start:engine', SEARCH_ENGINES[0]!.id)
const engine = computed(() => SEARCH_ENGINES.find(e => e.id === engineId.value) ?? SEARCH_ENGINES[0]!)
const query = ref('')
const input = useTemplateRef<{ inputRef: HTMLInputElement }>('input')

function cycle(step: 1 | -1) {
  const index = SEARCH_ENGINES.findIndex(e => e.id === engine.value.id)
  engineId.value = SEARCH_ENGINES[(index + step + SEARCH_ENGINES.length) % SEARCH_ENGINES.length]!.id
}

function submit() {
  const target = resolveSearchTarget(query.value, engine.value)
  if (target) window.top!.location.href = target
}

defineShortcuts({
  '/': () => input.value?.inputRef.focus()
})

onMounted(() => input.value?.inputRef.focus())
</script>

<template>
  <form class="w-full" role="search" @submit.prevent="submit">
    <div class="flex items-center gap-3 border-b-2 border-highlighted pb-2">
      <UDropdownMenu
        :items="SEARCH_ENGINES.map(e => ({ label: e.label, icon: e.icon, onSelect: () => { engineId = e.id } }))"
        :content="{ align: 'start' }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          :icon="engine.icon"
          :aria-label="`当前搜索引擎：${engine.label}`"
          trailing-icon="i-lucide-chevron-down"
          class="font-mono text-xs"
        >
          {{ engine.label }}
        </UButton>
      </UDropdownMenu>

      <UInput
        ref="input"
        v-model="query"
        variant="none"
        size="xl"
        class="flex-1"
        :ui="{ base: 'font-display text-2xl sm:text-3xl px-0' }"
        placeholder="搜索，或输入网址"
        aria-label="搜索或输入网址"
        autocomplete="off"
        @keydown.tab.exact.prevent="cycle(1)"
        @keydown.shift.tab.prevent="cycle(-1)"
      />

      <UButton type="submit" icon="i-lucide-arrow-right" aria-label="搜索" />
    </div>
    <p class="mt-2 kicker">
      <kbd>/</kbd> 聚焦 · <kbd>Tab</kbd> 切换引擎 · <kbd>Enter</kbd> 搜索
    </p>
  </form>
</template>
