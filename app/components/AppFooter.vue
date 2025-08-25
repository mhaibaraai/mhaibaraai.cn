<script setup lang="ts">
const { footer } = useAppConfig()
</script>

<template>
  <UFooter
    :ui="{
      left: 'text-sm text-muted',
      root: 'border-t border-default',
    }"
  >
    <template #left>
      {{ footer.credits }}
    </template>

    <template #right>
      <template v-if="footer?.links">
        <UTooltip
          v-for="link in footer.links"
          :key="link['aria-label']"
          :text="link['aria-label']"
          class="hidden lg:flex"
        >
          <UButton v-bind="{ color: 'neutral', variant: 'ghost', ...link }" />
        </UTooltip>
      </template>
    </template>
  </UFooter>
</template>
