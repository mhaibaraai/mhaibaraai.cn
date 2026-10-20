<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')

const { data: notes } = await useAsyncData('home-latest', () =>
  queryCollection('docs')
    .where('path', 'NOT LIKE', '%/.navigation')
    .select('path', 'stem', 'title', 'description', 'date')
    .order('date', 'DESC')
    .limit(7)
    .all()
)

const { data: projects } = await useAsyncData('home-projects', () => queryCollection('projects').first(), {
  transform: data => data?.items.filter(item => item.featured) ?? []
})

const { data: now } = await useAsyncData('home-now', () =>
  queryCollection('now').select('description', 'date', 'path').first()
)

const latest = computed(() => (notes.value ?? []).map(note => ({
  ...note,
  section: findSectionTitle(navigation?.value, note.path)
})))

const sections = computed(() => toNoteSections(navigation?.value))
const marquee = computed(() => sections.value.map(section => section.title).concat(['书签', '配置中心', 'Dotfiles', 'Uses', 'Now']))

useSeoMeta({
  title: '',
  description: 'YiXuan 的技术博客——分享 Vue、Nuxt、TypeScript、Java 全栈开发经验，从代码片段到架构思考，记录成长为优秀工程师路上的每一步。'
})
</script>

<template>
  <div>
    <HomeCover :lines="latest.slice(0, 5)" />
    <HomeMarquee :items="marquee" />
    <HomeLatest :notes="latest" />
    <HomeSections :sections="sections" />
    <HomeProjects :projects="projects ?? []" />
    <HomeToolbox :now="now ?? undefined" />
  </div>
</template>
