import type { ContentNavigationItem } from '@nuxt/content'

export interface NoteSection {
  title: string
  path: string
  icon?: string
  description?: string
  count: number
  firstPath?: string
}

function leaves(item: ContentNavigationItem): ContentNavigationItem[] {
  return item.children?.length ? item.children.flatMap(leaves) : [item]
}

/** 汇总顶层分类及其笔记数量 */
export function toNoteSections(navigation: ContentNavigationItem[] = []): NoteSection[] {
  return navigation.map((item) => {
    const pages = leaves(item)
    return {
      title: item.title,
      path: item.path,
      icon: item.icon as string | undefined,
      description: item.description as string | undefined,
      count: pages.length,
      firstPath: pages[0]?.path
    }
  })
}

/** 根据页面路径找到所属顶层分类标题 */
export function findSectionTitle(navigation: ContentNavigationItem[] = [], path: string): string | undefined {
  return navigation.find(item => path.startsWith(`${item.path}/`))?.title
}
