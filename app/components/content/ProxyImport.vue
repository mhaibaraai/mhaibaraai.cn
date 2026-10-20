<script setup lang="ts">
const props = defineProps<{
  client: 'surge' | 'quantumult-x'
}>()

const { siteUrl } = useRuntimeConfig().public
const toast = useToast()
const { copy } = useClipboard()

const templateUrl = computed(() => `${siteUrl}/proxy/${props.client}/template.conf`)

const installUrl = computed(() => props.client === 'surge'
  ? surgeInstallUrl(templateUrl.value)
  : qxAddResourceUrl('filter_remote', RULE_SETS.map(set => ({
      url: ruleSetUrl(siteUrl, 'quantumult-x', set.name),
      tag: set.title,
      policy: set.qxPolicy
    })))
)

async function copyUrl() {
  await copy(templateUrl.value)
  toast.add({ title: '已复制模板地址', icon: 'i-lucide-check', color: 'success' })
}
</script>

<template>
  <div class="not-prose my-8 grid gap-px border border-default bg-(--ui-border) sm:grid-cols-3">
    <a :href="installUrl" class="group flex flex-col gap-2 bg-default p-5 transition-colors hover:bg-inverted hover:text-inverted">
      <UIcon name="i-lucide-download" class="size-5 text-primary" />
      <span class="font-display text-lg font-bold">{{ client === 'surge' ? '一键安装配置' : '一键添加规则集' }}</span>
      <span class="text-xs text-muted group-hover:text-inverted/70">在装有 {{ client === 'surge' ? 'Surge' : 'Quantumult X' }} 的设备上点击</span>
    </a>
    <a :href="templateUrl" target="_blank" class="group flex flex-col gap-2 bg-default p-5 transition-colors hover:bg-inverted hover:text-inverted">
      <UIcon name="i-lucide-file-code" class="size-5 text-primary" />
      <span class="font-display text-lg font-bold">查看模板</span>
      <span class="text-xs text-muted group-hover:text-inverted/70 break-all">/proxy/{{ client }}/template.conf</span>
    </a>
    <button type="button" class="group flex flex-col gap-2 bg-default p-5 text-start transition-colors hover:bg-inverted hover:text-inverted" @click="copyUrl">
      <UIcon name="i-lucide-copy" class="size-5 text-primary" />
      <span class="font-display text-lg font-bold">复制模板地址</span>
      <span class="text-xs text-muted group-hover:text-inverted/70">用于托管配置或手动导入</span>
    </button>
  </div>
</template>
