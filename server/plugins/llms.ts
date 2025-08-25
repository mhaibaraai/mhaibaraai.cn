export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('llms:generate', (_, { sections }) => {
    sections.forEach((section) => {
      if (section.links) {
        section.links = section.links.map(link => ({
          ...link,
          href: `${link.href.replace(/^https:\/\/mhaibaraai.cn/, 'https://mhaibaraai.cn/raw')}.md`,
        }))
      }
    })
  })
})
