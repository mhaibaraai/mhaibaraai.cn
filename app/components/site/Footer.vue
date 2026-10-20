<script setup lang="ts">
const appConfig = useAppConfig()
const { version } = useRuntimeConfig().public
const year = new Date().getFullYear()

const columns = computed(() => [
  { title: '栏目', links: appConfig.nav },
  { title: '附录', links: appConfig.navMore },
  { title: '订阅与联系', links: appConfig.socials }
])
</script>

<template>
  <footer class="mt-24 border-t border-default">
    <UContainer class="py-16">
      <div class="grid gap-12 lg:grid-cols-12">
        <div class="lg:col-span-5">
          <p class="font-display text-5xl sm:text-6xl font-black italic leading-none text-highlighted">
            YiXuan<span class="text-primary">.</span>
          </p>
          <p class="mt-4 max-w-sm text-muted">
            从代码片段到架构思考，记录成为更优秀全栈工程师路上的一切。
          </p>
        </div>

        <nav
          v-for="column in columns"
          :key="column.title"
          class="lg:col-span-2"
          :aria-label="column.title"
        >
          <p class="kicker mb-4">
            {{ column.title }}
          </p>
          <ul class="space-y-2">
            <li v-for="link in column.links" :key="link.to">
              <ULink :to="link.to" class="link-wipe text-sm text-toned hover:text-highlighted" :external="link.to.startsWith('/') && link.to.includes('.')">
                {{ link.label }}
              </ULink>
            </li>
          </ul>
        </nav>
      </div>

      <div class="rule-double mt-16 pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between kicker">
        <span>© {{ appConfig.site.since }}–{{ year }} {{ appConfig.site.author }} · MIT License</span>
        <span>Set in Fraunces &amp; Noto Serif SC · v{{ version }}</span>
      </div>
    </UContainer>
  </footer>
</template>
