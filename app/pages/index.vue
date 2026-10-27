<script setup lang="ts">
const navigation = useDocsNavigation()

const { data: notes } = await useAsyncData('home-latest', () =>
  queryCollection('docs')
    .where('path', 'NOT LIKE', '%/.navigation')
    .select('path', 'stem', 'title', 'description', 'meta')
    .all(), {
  transform: data => sortNotesByDate(data).slice(0, 7)
})

const { data: projects } = await useAsyncData('home-projects', () => queryCollection('projects').first(), {
  transform: data => data?.items.filter(item => item.featured) ?? []
})

const { data: now } = await useAsyncData('home-now', () =>
  queryCollection('now').select('description', 'date', 'path').first()
)

const latest = computed(() => (notes.value ?? []).map(({ meta, ...note }) => ({
  ...note,
  date: noteDate({ meta }),
  section: findSectionTitle(navigation.value, note.path)
})))

const sections = computed(() => toNoteSections(navigation.value))
const marquee = computed(() => sections.value.map(section => section.title).concat(['书签', '配置中心', 'Dotfiles', 'Uses', 'Now']))

const site = useSiteConfig()

useSeoMeta({
  titleTemplate: '%s',
  title: site.name,
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
