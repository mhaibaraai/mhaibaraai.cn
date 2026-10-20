<script setup lang="ts">
const props = defineProps<{
  client: 'surge' | 'quantumult-x'
}>()

const { siteUrl } = useRuntimeConfig().public

const rows = computed(() => RULE_SETS.map(set => ({
  ...set,
  url: ruleSetUrl(siteUrl, props.client, set.name),
  install: props.client === 'quantumult-x'
    ? qxAddResourceUrl('filter_remote', [{ url: ruleSetUrl(siteUrl, 'quantumult-x', set.name), tag: set.title, policy: set.qxPolicy }])
    : undefined
})))
</script>

<template>
  <div class="my-6 border-t border-inverted">
    <div v-for="row in rows" :key="row.name" class="grid gap-2 border-b border-default py-4 sm:grid-cols-[8rem_1fr_auto] sm:items-center">
      <span class="font-display text-xl font-bold text-highlighted">{{ row.title }}</span>
      <span>
        <span class="block text-sm text-toned">{{ row.description }}</span>
        <code class="text-xs text-muted break-all">{{ row.url }}</code>
      </span>
      <span class="flex gap-2">
        <UButton :href="row.url" target="_blank" size="xs" color="neutral" variant="outline">
          查看
        </UButton>
        <UButton v-if="row.install" :href="row.install" size="xs">
          添加
        </UButton>
      </span>
    </div>
  </div>
</template>
